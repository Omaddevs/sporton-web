// Skriptlar Next’siz ishlaydi — .env.local / .env ni o‘zimiz yuklaymiz
import { existsSync } from 'node:fs'

for (const file of ['.env.local', '.env']) {
  if (existsSync(file)) process.loadEnvFile(file)
}
