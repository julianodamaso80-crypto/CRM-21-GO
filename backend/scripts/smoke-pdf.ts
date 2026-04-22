import { generateQuotePdf, closeBrowser } from '../src/modules/plate-lookup/pdf-quote.service'
import { writeFileSync } from 'fs'
import { join } from 'path'

async function main() {
  const pdf = await generateQuotePdf({
    nome: 'Juliano Damaso',
    whatsapp: '21979034169',
    placa: 'ABC1D23',
    marca: 'Jeep',
    modelo: 'COMPASS LONG. T270 1.3 TB 4x2 Flex Aut.',
    ano: '2022',
    cor: 'Cinza',
    fipe: 122456,
    planoNome: 'SUV',
    mensalidade: 537,
    isMoto: false,
  })
  const out = join(process.cwd(), 'smoke-quote.pdf')
  writeFileSync(out, pdf)
  console.log('OK — PDF gerado em', out, 'tamanho:', pdf.length, 'bytes')
  await closeBrowser()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
