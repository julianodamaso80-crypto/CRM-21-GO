import fs from 'fs'
import path from 'path'

const dbPath = path.join(__dirname, 'db.json')

interface Database {
  users: any[]
  companies: any[]
  roles: any[]
  refreshTokens: any[]
}

class JsonDatabase {
  private db: Database

  constructor() {
    this.db = this.load()
  }

  private load(): Database {
    try {
      const data = fs.readFileSync(dbPath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      return {
        users: [],
        companies: [],
        roles: [],
        refreshTokens: [],
      }
    }
  }

  private save() {
    fs.writeFileSync(dbPath, JSON.stringify(this.db, null, 2))
  }

  // Users
  findUserByEmail(email: string) {
    return this.db.users.find(u => u.email === email)
  }

  findUserById(id: string) {
    return this.db.users.find(u => u.id === id)
  }

  createUser(user: any) {
    this.db.users.push(user)
    this.save()
    return user
  }

  updateUser(id: string, data: any) {
    const index = this.db.users.findIndex(u => u.id === id)
    if (index !== -1) {
      this.db.users[index] = { ...this.db.users[index], ...data }
      this.save()
      return this.db.users[index]
    }
    return null
  }

  // Companies
  findCompanyById(id: string) {
    return this.db.companies.find(c => c.id === id)
  }

  createCompany(company: any) {
    this.db.companies.push(company)
    this.save()
    return company
  }

  // Roles
  findRoleById(id: string) {
    return this.db.roles.find(r => r.id === id)
  }

  createRole(role: any) {
    this.db.roles.push(role)
    this.save()
    return role
  }

  // Refresh Tokens
  createRefreshToken(token: any) {
    this.db.refreshTokens.push(token)
    this.save()
    return token
  }

  findRefreshToken(token: string) {
    return this.db.refreshTokens.find(t => t.token === token)
  }

  deleteRefreshToken(token: string) {
    this.db.refreshTokens = this.db.refreshTokens.filter(t => t.token !== token)
    this.save()
  }
}

export const jsonDb = new JsonDatabase()
