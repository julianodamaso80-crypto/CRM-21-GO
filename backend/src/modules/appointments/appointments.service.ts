import { prisma } from '../../config/database'
import { AppError } from '../../utils/app-error'

export interface CreateAppointmentDTO {
  patientId: string
  doctorId: string
  type: string
  date: string
  startTime: string
  duration?: number
  notes?: string
  convenioId?: string
  price?: number
  room?: string
}

export interface UpdateAppointmentDTO {
  type?: string
  status?: string
  date?: string
  startTime?: string
  duration?: number
  notes?: string
  cancellationReason?: string
  price?: number
  isPaid?: boolean
  room?: string
}

export interface ListAppointmentsQuery {
  date?: string
  dateFrom?: string
  dateTo?: string
  doctorId?: string
  patientId?: string
  status?: string
}

/**
 * Calcula o horário de término a partir do horário de início e duração
 */
function calculateEndTime(startTime: string, duration: number): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + duration
  const endHours = Math.floor(totalMinutes / 60) % 24
  const endMinutes = totalMinutes % 60
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
}

export class AppointmentsService {
  /**
   * Lista agendamentos com filtros
   */
  async listAppointments(companyId: string, query: ListAppointmentsQuery) {
    const where: any = {
      companyId,
    }

    // Filtro por data exata
    if (query.date) {
      where.date = new Date(query.date)
    }

    // Filtro por range de datas
    if (query.dateFrom || query.dateTo) {
      where.date = {}
      if (query.dateFrom) {
        where.date.gte = new Date(query.dateFrom)
      }
      if (query.dateTo) {
        where.date.lte = new Date(query.dateTo)
      }
    }

    // Filtro por médico
    if (query.doctorId) {
      where.doctorId = query.doctorId
    }

    // Filtro por paciente
    if (query.patientId) {
      where.patientId = query.patientId
    }

    // Filtro por status
    if (query.status) {
      where.status = query.status
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialty: true,
            crm: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    return appointments
  }

  /**
   * Busca agendamento por ID
   */
  async getAppointmentById(id: string, companyId: string) {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialty: true,
            crm: true,
          },
        },
      },
    })

    if (!appointment) {
      throw new AppError('Appointment not found', 404, 'NOT_FOUND')
    }

    return appointment
  }

  /**
   * Cria novo agendamento
   */
  async createAppointment(companyId: string, data: CreateAppointmentDTO) {
    const duration = data.duration || 30
    const endTime = calculateEndTime(data.startTime, duration)

    const appointment = await prisma.appointment.create({
      data: {
        companyId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        type: data.type,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime,
        duration,
        notes: data.notes,
        convenioId: data.convenioId,
        price: data.price,
        room: data.room,
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialty: true,
            crm: true,
          },
        },
      },
    })

    return appointment
  }

  /**
   * Atualiza agendamento existente
   */
  async updateAppointment(id: string, companyId: string, data: UpdateAppointmentDTO) {
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!existingAppointment) {
      throw new AppError('Appointment not found', 404, 'NOT_FOUND')
    }

    // Recalcular endTime se startTime ou duration mudaram
    const updateData: any = { ...data }
    if (data.startTime || data.duration) {
      const startTime = data.startTime || existingAppointment.startTime
      const duration = data.duration || existingAppointment.duration
      updateData.endTime = calculateEndTime(startTime, duration)
    }

    // Converter date para Date se fornecido
    if (data.date) {
      updateData.date = new Date(data.date)
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialty: true,
            crm: true,
          },
        },
      },
    })

    return appointment
  }

  /**
   * Deleta agendamento
   */
  async deleteAppointment(id: string, companyId: string) {
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!existingAppointment) {
      throw new AppError('Appointment not found', 404, 'NOT_FOUND')
    }

    await prisma.appointment.delete({
      where: { id },
    })

    return { success: true, message: 'Appointment deleted' }
  }

  /**
   * Estatísticas de agendamentos
   */
  async getStats(companyId: string) {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    // Início da semana (segunda-feira)
    const weekStart = new Date(todayStart)
    const dayOfWeek = weekStart.getDay()
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    weekStart.setDate(weekStart.getDate() - diffToMonday)

    // Fim da semana (domingo)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    // Início do mês
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const [
      today,
      thisWeek,
      thisMonth,
      cancelled,
      noShow,
      completedToday,
      upcomingToday,
    ] = await Promise.all([
      prisma.appointment.count({
        where: {
          companyId,
          date: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.appointment.count({
        where: {
          companyId,
          date: { gte: weekStart, lte: weekEnd },
        },
      }),
      prisma.appointment.count({
        where: {
          companyId,
          date: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.appointment.count({
        where: {
          companyId,
          status: 'cancelled',
        },
      }),
      prisma.appointment.count({
        where: {
          companyId,
          status: 'no_show',
        },
      }),
      prisma.appointment.count({
        where: {
          companyId,
          status: 'completed',
          date: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.appointment.count({
        where: {
          companyId,
          status: { in: ['scheduled', 'confirmed'] },
          date: { gte: todayStart, lte: todayEnd },
        },
      }),
    ])

    return {
      today,
      thisWeek,
      thisMonth,
      cancelled,
      noShow,
      completedToday,
      upcomingToday,
    }
  }

  /**
   * Retorna os tipos de agendamento disponíveis
   */
  getTypes(): Record<string, string> {
    return {
      first_visit: 'Primeira Consulta',
      return: 'Retorno',
      exam: 'Exame',
      procedure: 'Procedimento',
      consultation: 'Consulta',
      emergency: 'Emergência',
    }
  }

  /**
   * Retorna disponibilidade de horários para um médico em uma data
   */
  async getAvailability(companyId: string, doctorId: string, date: string) {
    // Buscar agendamentos existentes do médico na data
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        companyId,
        doctorId,
        date: new Date(date),
        status: { notIn: ['cancelled'] },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    })

    // Gerar slots de 08:00 às 18:00 a cada 30 minutos
    const slots: Array<{ startTime: string; endTime: string; available: boolean }> = []
    const slotDuration = 30

    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        const endTime = calculateEndTime(startTime, slotDuration)

        // Verificar se o slot está ocupado
        const isOccupied = existingAppointments.some((appt) => {
          return appt.startTime < endTime && appt.endTime! > startTime
        })

        slots.push({
          startTime,
          endTime,
          available: !isOccupied,
        })
      }
    }

    return {
      doctorId,
      date,
      slots,
    }
  }
}
