'use client'

import { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'

type Column = { key: string; label: string; placeholder?: string; multiline?: boolean; width?: number; required?: boolean }
type Row = Record<string, string>

/**
 * Takrorlanuvchi qatorlar (dastur, savol-javob, abzatslar…). Natija — hidden input’da JSON.
 * Bitta ustun bo‘lsa (`single`) — satrlar massivi, aks holda obyektlar massivi.
 */
export default function ListField({
  name,
  columns,
  initial = [],
  addLabel = 'Qo‘shish',
  emptyText,
}: {
  name: string
  columns: Column[]
  initial?: Array<string | Row>
  addLabel?: string
  emptyText?: string
}) {
  const single = columns.length === 1
  const key = columns[0].key
  const [rows, setRows] = useState<Row[]>(() =>
    initial.map((r) => (typeof r === 'string' ? { [key]: r } : Object.fromEntries(columns.map((c) => [c.key, r[c.key] ?? ''])))),
  )

  const blank = () => Object.fromEntries(columns.map((c) => [c.key, '']))
  const update = (i: number, k: string, v: string) => setRows((list) => list.map((r, j) => (j === i ? { ...r, [k]: v } : r)))
  const move = (i: number, d: number) =>
    setRows((list) => {
      const next = [...list]
      ;[next[i], next[i + d]] = [next[i + d], next[i]]
      return next
    })

  // Bo‘sh qatorlar saqlanmaydi
  const value = rows
    .map((r) => Object.fromEntries(columns.map((c) => [c.key, (r[c.key] ?? '').trim()])))
    .filter((r) => columns.some((c) => r[c.key]))
    .map((r) => (single ? r[key] : r))

  return (
    <div className="list-field">
      <input type="hidden" name={name} value={JSON.stringify(value)} />
      {rows.length === 0 && emptyText && <p className="muted list-field__empty">{emptyText}</p>}
      {rows.map((row, i) => (
        <div key={i} className="list-field__row">
          <span className="list-field__num">{i + 1}</span>
          <div className="list-field__cells">
            {columns.map((c) =>
              c.multiline ? (
                <textarea
                  key={c.key}
                  className="textarea"
                  rows={2}
                  value={row[c.key] ?? ''}
                  placeholder={c.placeholder ?? c.label}
                  aria-label={c.label}
                  onChange={(e) => update(i, c.key, e.target.value)}
                  style={{ flex: c.width ? `0 0 ${c.width}px` : 1 }}
                />
              ) : (
                <input
                  key={c.key}
                  className="input"
                  value={row[c.key] ?? ''}
                  placeholder={c.placeholder ?? c.label}
                  aria-label={c.label}
                  onChange={(e) => update(i, c.key, e.target.value)}
                  style={{ flex: c.width ? `0 0 ${c.width}px` : 1 }}
                />
              ),
            )}
          </div>
          <div className="list-field__tools">
            <button type="button" className="btn btn--sm btn--icon" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Yuqoriga">
              <ArrowUp />
            </button>
            <button type="button" className="btn btn--sm btn--icon" disabled={i === rows.length - 1} onClick={() => move(i, 1)} aria-label="Pastga">
              <ArrowDown />
            </button>
            <button
              type="button"
              className="btn btn--sm btn--icon btn--danger"
              onClick={() => setRows((list) => list.filter((_, j) => j !== i))}
              aria-label="O‘chirish"
            >
              <Trash2 />
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn--sm" onClick={() => setRows((list) => [...list, blank()])} style={{ justifySelf: 'start' }}>
        <Plus /> {addLabel}
      </button>
    </div>
  )
}
