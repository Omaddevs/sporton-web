#!/bin/sh
# SportON zaxira nusxalari (docker compose «backup» xizmati ichida ishlaydi).
#   • baza: har kuni pg_dump → /backups/db/sporton-YYYY-MM-DD-HHMM.sql.gz
#   • yuklangan fayllar (rasm/video): har kuni tar → /backups/uploads/uploads-YYYY-MM-DD.tar.gz
#   • BACKUP_KEEP_DAYS kundan eskilari o‘chiriladi (standart: 14)
#
# Tiklash:
#   gunzip -c backups/db/sporton-….sql.gz | docker compose exec -T db psql -U sporton sporton
#   docker compose run --rm -v "$PWD/backups:/backups" backend sh -c 'tar -xzf /backups/uploads/uploads-….tar.gz -C /'
set -eu

KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
INTERVAL="${BACKUP_INTERVAL_SECONDS:-86400}"
mkdir -p /backups/db /backups/uploads

run_backup() {
  stamp="$(date +%Y-%m-%d-%H%M)"
  db_file="/backups/db/sporton-$stamp.sql.gz"
  # Avval vaqtinchalik faylga — yarim yozilgan zaxira «tayyor» ko‘rinib qolmasin
  if pg_dump -h db -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip -9 > "$db_file.part"; then
    mv "$db_file.part" "$db_file"
    echo "[backup] baza: $db_file ($(du -h "$db_file" | cut -f1))"
  else
    rm -f "$db_file.part"
    echo "[backup] XATO: pg_dump muvaffaqiyatsiz" >&2
  fi

  if [ -d /data ]; then
    up_file="/backups/uploads/uploads-$(date +%Y-%m-%d).tar.gz"
    tar -czf "$up_file.part" -C / data && mv "$up_file.part" "$up_file" && echo "[backup] fayllar: $up_file"
  fi

  find /backups/db /backups/uploads -type f -mtime "+$KEEP_DAYS" -print -delete
}

until pg_isready -h db -U "$POSTGRES_USER" >/dev/null 2>&1; do sleep 3; done
while true; do
  run_backup
  sleep "$INTERVAL"
done
