import { generateQuotePdf, closeBrowser } from '../src/modules/plate-lookup/pdf-quote.service'
import fs from 'fs'
import path from 'path'

process.env.PUPPETEER_EXECUTABLE_PATH =
  process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

async function main() {
  const outDir = path.join(__dirname, '..', '..', 'tmp')
  fs.mkdirSync(outDir, { recursive: true })

  // Exemplo 1: Jeep Compass (SUV/Caminhonete)
  const pdfSuv = await generateQuotePdf({
    nome: 'Juliano Damaso',
    whatsapp: '21979034169',
    email: 'flowaidigital@gmail.com',
    placa: 'ABC1234',
    marca: 'Jeep',
    modelo: 'Compass Limited 2.0',
    ano: 2022,
    cor: 'Preto',
    fipe: 130000,
    planoNome: 'SUV',
    mensalidade: 130000 * 0.028 + 35,
    taxaAtivacao: 399,
    isMoto: false,
    categoria: 'CAMINHONETE',
    combustivel: 'GASOLINA',
  })
  const outSuv = path.join(outDir, 'preview-cotacao.pdf')
  fs.writeFileSync(outSuv, pdfSuv)
  console.log('PDF SUV salvo em:', outSuv, `(${pdfSuv.length} bytes)`)

  // Exemplo 2: Honda Civic (carro normal — mostra os 4 planos)
  const pdfCarro = await generateQuotePdf({
    nome: 'Juliano Damaso',
    whatsapp: '21979034169',
    email: 'flowaidigital@gmail.com',
    placa: 'XYZ9876',
    marca: 'Honda',
    modelo: 'Civic EXL 2.0',
    ano: 2021,
    cor: 'Prata',
    fipe: 95000,
    planoNome: 'VIP',
    mensalidade: 95000 * 0.028 + 35,
    taxaAtivacao: 399,
    isMoto: false,
    categoria: 'AUTOMOVEL',
    combustivel: 'GASOLINA',
  })
  const outCarro = path.join(outDir, 'preview-cotacao-civic.pdf')
  fs.writeFileSync(outCarro, pdfCarro)
  console.log('PDF Civic salvo em:', outCarro, `(${pdfCarro.length} bytes)`)

  await closeBrowser()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
