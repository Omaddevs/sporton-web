import 'server-only'
import { NextResponse } from 'next/server'
import { ZodError, type ZodType } from 'zod'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public field?: string,
  ) {
    super(message)
  }
}

export const notFound = (what = 'Ma’lumot') => new ApiError(404, 'NOT_FOUND', `${what} topilmadi`)

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init)
}

function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, field: error.field } },
      { status: error.status },
    )
  }
  if (error instanceof ZodError) {
    const issue = error.issues[0]
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: issue?.message ?? 'Ma’lumotlar noto‘g‘ri',
          field: issue?.path?.[0] != null ? String(issue.path[0]) : undefined,
        },
      },
      { status: 422 },
    )
  }
  console.error('[api]', error)
  return NextResponse.json(
    { error: { code: 'INTERNAL', message: 'Serverda xatolik. Birozdan so‘ng qayta urinib ko‘ring' } },
    { status: 500 },
  )
}

type Ctx<P> = { params: Promise<P> }

/** Route handler o‘rami: xatolarni yagona formatga keltiradi */
export function route<P = Record<string, string>>(
  fn: (request: Request, ctx: Ctx<P>) => Promise<Response>,
) {
  return async (request: Request, ctx: Ctx<P>) => {
    try {
      return await fn(request, ctx)
    } catch (error) {
      return errorResponse(error)
    }
  }
}

export async function readJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    throw new ApiError(400, 'BAD_JSON', 'So‘rov tanasi noto‘g‘ri')
  }
  return schema.parse(body)
}
