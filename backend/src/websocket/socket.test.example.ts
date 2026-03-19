// @ts-nocheck
/**
 * SOCKET.IO TEST EXAMPLES
 *
 * Exemplos de como testar Socket.io endpoints.
 * Requer: npm install --save-dev socket.io-client
 *
 * Para rodar os testes:
 * 1. Iniciar o servidor (npm run dev)
 * 2. Rodar: tsx src/websocket/socket.test.example.ts
 */

import { io, Socket } from 'socket.io-client'

const BACKEND_URL = 'http://localhost:3333'

// Mock de token JWT válido (você precisa gerar um real)
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

async function testSocketConnection() {
  console.log('🧪 Test 1: Socket Connection with JWT')

  const socket: Socket = io(BACKEND_URL, {
    auth: {
      token: MOCK_TOKEN,
    },
    transports: ['websocket'],
  })

  return new Promise((resolve, reject) => {
    socket.on('connect', () => {
      console.log('✅ Connected successfully!')
      console.log('   Socket ID:', socket.id)
      socket.disconnect()
      resolve(true)
    })

    socket.on('connect_error', (error) => {
      console.log('❌ Connection failed:', error.message)
      reject(error)
    })

    setTimeout(() => {
      reject(new Error('Connection timeout'))
    }, 5000)
  })
}

async function testJoinRoom() {
  console.log('\n🧪 Test 2: Join Room')

  const socket: Socket = io(BACKEND_URL, {
    auth: { token: MOCK_TOKEN },
  })

  return new Promise((resolve, reject) => {
    socket.on('connect', () => {
      console.log('✅ Connected')

      socket.emit('join_room', { room: 'conversation:test-123' }, (response: any) => {
        if (response.success) {
          console.log('✅ Joined room:', response.room)
          socket.disconnect()
          resolve(true)
        } else {
          console.log('❌ Failed to join room:', response.error)
          socket.disconnect()
          reject(new Error(response.error))
        }
      })
    })

    socket.on('connect_error', (error) => {
      console.log('❌ Connection failed:', error.message)
      reject(error)
    })

    setTimeout(() => {
      socket.disconnect()
      reject(new Error('Test timeout'))
    }, 5000)
  })
}

async function testTypingIndicator() {
  console.log('\n🧪 Test 3: Typing Indicator')

  const socket1: Socket = io(BACKEND_URL, {
    auth: { token: MOCK_TOKEN },
  })

  const socket2: Socket = io(BACKEND_URL, {
    auth: { token: MOCK_TOKEN },
  })

  return new Promise((resolve) => {
    let connected = 0
    const conversationId = 'test-conversation-123'

    const onConnect = () => {
      connected++
      if (connected === 2) {
        // Ambos conectados, entrar na mesma room
        socket1.emit('join_room', { room: `conversation:${conversationId}` })
        socket2.emit('join_room', { room: `conversation:${conversationId}` })

        // Socket2 escuta eventos de typing
        socket2.on('inbox:typing', (data) => {
          console.log('✅ Socket2 received typing event:', data)
          socket1.disconnect()
          socket2.disconnect()
          resolve(true)
        })

        // Socket1 emite typing
        setTimeout(() => {
          console.log('   Socket1 emitting typing...')
          socket1.emit('typing', { conversationId })
        }, 500)

        setTimeout(() => {
          console.log('⚠️  No typing event received')
          socket1.disconnect()
          socket2.disconnect()
          resolve(false)
        }, 3000)
      }
    }

    socket1.on('connect', onConnect)
    socket2.on('connect', onConnect)
  })
}

async function testMultipleRooms() {
  console.log('\n🧪 Test 4: Multiple Rooms')

  const socket: Socket = io(BACKEND_URL, {
    auth: { token: MOCK_TOKEN },
  })

  return new Promise((resolve) => {
    socket.on('connect', () => {
      console.log('✅ Connected')

      const rooms = [
        'conversation:room1',
        'conversation:room2',
        'pipe:pipe-123',
      ]

      let joined = 0

      rooms.forEach((room) => {
        socket.emit('join_room', { room }, (response: any) => {
          if (response.success) {
            console.log(`✅ Joined ${room}`)
            joined++

            if (joined === rooms.length) {
              console.log('✅ All rooms joined successfully')
              socket.disconnect()
              resolve(true)
            }
          }
        })
      })

      setTimeout(() => {
        console.log(`⚠️  Only ${joined}/${rooms.length} rooms joined`)
        socket.disconnect()
        resolve(false)
      }, 5000)
    })
  })
}

async function testPresenceEvents() {
  console.log('\n🧪 Test 5: Presence Events (Online/Offline)')

  const socket1: Socket = io(BACKEND_URL, {
    auth: { token: MOCK_TOKEN },
  })

  const socket2: Socket = io(BACKEND_URL, {
    auth: { token: MOCK_TOKEN },
  })

  return new Promise((resolve) => {
    socket1.on('connect', () => {
      console.log('✅ Socket1 connected')

      // Socket1 escuta por user:online
      socket1.on('user:online', (data) => {
        console.log('✅ Socket1 received user:online event:', data.userId)
      })

      // Socket1 escuta por user:offline
      socket1.on('user:offline', (data) => {
        console.log('✅ Socket1 received user:offline event:', data.userId)
        socket1.disconnect()
        resolve(true)
      })

      // Conectar socket2 (deve emitir user:online)
      setTimeout(() => {
        console.log('   Connecting Socket2...')
        socket2.connect()
      }, 500)

      // Desconectar socket2 (deve emitir user:offline)
      setTimeout(() => {
        console.log('   Disconnecting Socket2...')
        socket2.disconnect()
      }, 2000)

      setTimeout(() => {
        console.log('⚠️  Timeout waiting for presence events')
        socket1.disconnect()
        socket2.disconnect()
        resolve(false)
      }, 5000)
    })
  })
}

async function testUnauthorizedConnection() {
  console.log('\n🧪 Test 6: Unauthorized Connection (should fail)')

  const socket: Socket = io(BACKEND_URL, {
    auth: {
      token: 'invalid-token',
    },
  })

  return new Promise((resolve) => {
    socket.on('connect', () => {
      console.log('❌ Should NOT have connected with invalid token')
      socket.disconnect()
      resolve(false)
    })

    socket.on('connect_error', (error) => {
      console.log('✅ Correctly rejected invalid token:', error.message)
      resolve(true)
    })

    setTimeout(() => {
      socket.disconnect()
      resolve(false)
    }, 3000)
  })
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runTests() {
  console.log('╔════════════════════════════════════════════════╗')
  console.log('║       SOCKET.IO INTEGRATION TESTS              ║')
  console.log('╚════════════════════════════════════════════════╝\n')

  try {
    // Test 1: Basic connection
    // await testSocketConnection()

    // Test 2: Join room
    // await testJoinRoom()

    // Test 3: Typing indicator
    // await testTypingIndicator()

    // Test 4: Multiple rooms
    // await testMultipleRooms()

    // Test 5: Presence events
    // await testPresenceEvents()

    // Test 6: Unauthorized access
    // await testUnauthorizedConnection()

    console.log('\n✅ All tests passed!')
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

// Para rodar: descomente a linha abaixo
// runTests()

console.log(`
╔════════════════════════════════════════════════╗
║       SOCKET.IO TEST SUITE                     ║
╚════════════════════════════════════════════════╝

Para usar este arquivo de testes:

1. Certifique-se de que o servidor está rodando:
   cd backend && npm run dev

2. Gere um token JWT válido:
   - Faça login via POST /api/auth/login
   - Copie o token da resposta

3. Substitua MOCK_TOKEN pelo token real

4. Descomente a linha 'runTests()' no final do arquivo

5. Execute:
   tsx src/websocket/socket.test.example.ts

IMPORTANTE:
- Estes são testes de integração, não unitários
- Requerem servidor rodando
- Úteis para validar o comportamento real-time
`)

export {
  testSocketConnection,
  testJoinRoom,
  testTypingIndicator,
  testMultipleRooms,
  testPresenceEvents,
  testUnauthorizedConnection,
}
