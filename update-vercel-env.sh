#!/bin/bash
TOKEN=$(cat "/Users/onetech/Library/Application Support/com.vercel.cli/auth.json" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
PROJECT_ID="prj_7w3yxz3u34DZNBMFxs07i3YUgMje"

# Busca IDs das env vars existentes
ENVS=$(curl -s "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $TOKEN")

get_id() {
  echo "$ENVS" | python3 -c "import sys,json; envs=json.load(sys.stdin).get('envs',[]); match=[e for e in envs if e['key']=='$1']; print(match[0]['id'] if match else '')" 2>/dev/null
}

update_env() {
  local KEY="$1"
  local VALUE="$2"
  local ID=$(get_id "$KEY")

  if [ -z "$ID" ]; then
    # Criar nova
    RESULT=$(curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"key\":\"$KEY\",\"value\":\"$VALUE\",\"type\":\"encrypted\",\"target\":[\"production\",\"preview\",\"development\"]}")
  else
    # Atualizar existente
    RESULT=$(curl -s -X PATCH "https://api.vercel.com/v10/projects/$PROJECT_ID/env/$ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"value\":\"$VALUE\",\"type\":\"encrypted\",\"target\":[\"production\",\"preview\",\"development\"]}")
  fi
  echo "$KEY: $(echo $RESULT | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('key') or d.get('id') else d.get('error',{}).get('message','?'))" 2>/dev/null)"
}

update_env "NEXT_PUBLIC_SUPABASE_URL" "https://xebskockruobeovmqlhq.supabase.co"
update_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlYnNrb2NrcnVvYmVvdm1xbGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5ODE2OTUsImV4cCI6MjA5MDU1NzY5NX0.R-sJzmZREKNAvUyekmBvaLr1tkgrAAGI0F5u4PPMvFo"
update_env "SUPABASE_SERVICE_ROLE_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlYnNrb2NrcnVvYmVvdm1xbGhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk4MTY5NSwiZXhwIjoyMDkwNTU3Njk1fQ.umAq0gnvuFEuyhgM9XHjw9y5NKEceH200PBr1gWGNqA"
update_env "NEXT_PUBLIC_MP_PUBLIC_KEY" "APP_USR-afa84e81-2849-435b-a89a-463a8e737f5e"
update_env "MP_ACCESS_TOKEN" "APP_USR-7059306432028549-031609-32a36a625d7b1ab4e0393a92cec604a9-2120717526"
update_env "RESEND_API_KEY" "re_MJ8Z7VSk_EEmDmWRd6PL1Wc9oft1vKMH1"
update_env "MELHOR_ENVIO_TOKEN" "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNmNmNzVlN2EzYzI4YjBjY2FmZTJmYTgxZWNkNjA5OGEwN2I0YmM4YmYwOTYyNDUwYzJiYmI3YzNlYTEwMjcxZmQ2MDJkZWVhN2MxZDI2NDAiLCJpYXQiOjE3NzM2NjY2MDUuNjk2MDc0LCJuYmYiOjE3NzM2NjY2MDUuNjk2MDc1LCJleHAiOjE4MDUyMDI2MDUuNjgzMSwic3ViIjoiYTBkMTk3ZjItMmMyMy00YzA3LTgxYTEtNjc0OGRlYjY0NmFjIiwic2NvcGVzIjpbImNhcnQtcmVhZCIsImNhcnQtd3JpdGUiLCJjb21wYW5pZXMtcmVhZCIsImNvbXBhbmllcy13cml0ZSIsImNvdXBvbnMtcmVhZCIsImNvdXBvbnMtd3JpdGUiLCJub3RpZmljYXRpb25zLXJlYWQiLCJvcmRlcnMtcmVhZCIsInByb2R1Y3RzLXJlYWQiLCJwcm9kdWN0cy1kZXN0cm95IiwicHJvZHVjdHMtd3JpdGUiLCJwdXJjaGFzZXMtcmVhZCIsInNoaXBwaW5nLWNhbGN1bGF0ZSIsInNoaXBwaW5nLWNhbmNlbCIsInNoaXBwaW5nLWNoZWNrb3V0Iiwic2hpcHBpbmctY29tcGFuaWVzIiwic2hpcHBpbmctZ2VuZXJhdGUiLCJzaGlwcGluZy1wcmV2aWV3Iiwic2hpcHBpbmctcHJpbnQiLCJzaGlwcGluZy1zaGFyZSIsInNoaXBwaW5nLXRyYWNraW5nIiwiZWNvbW1lcmNlLXNoaXBwaW5nIiwidHJhbnNhY3Rpb25zLXJlYWQiLCJ1c2Vycy1yZWFkIiwidXNlcnMtd3JpdGUiLCJ3ZWJob29rcy1yZWFkIiwid2ViaG9va3Mtd3JpdGUiLCJ3ZWJob29rcy1kZWxldGUiLCJ0ZGVhbGVyLXdlYmhvb2siXX0.Y7FqsIyDZ5DYEvHOQMCpZZCzCowmiBk8NzYwmJUg2spC69uQi6Njqc3po4W7BccVD1xpQmmmt4bHm_OJASYgHbu0x-GwnJ9jG0SM0kCT6pI8Iy588fNOcvdzcjxlNgW-vp5EdzbZe50kHOo3Hq6_j7cFiRQBV81deQJUMMXh0XgifVhgRW1rr48L7W-8yW40KM9p_3S2JeCZAv6Q7S5Cjly6ZRd1NXkXhTgXVdUxlg_11Dcvv_1FQ52mSQUGzm0xBMIDeyBMWyftzWfFLUzGcBk5OEQ4IVrmOzDY9fVjrhdI57aSelbiYJUJOTeFepVmRmKv_4ZpDQFafPDCo6uZRr3pYtyMHrbUDieZyQibq4HiKcmVef8LmEdiDfMwQXmKvDGifY9DBy6BKlZnZXwMKzl0FOfgS_a21lTA-mcgGgStUZ9CuehsAT6r-YNwELGvJ9dhWNSIhHuLf7wrhdiaFJyau3INaLQqGanLTcVgxKEvZFYWIswkGWP3ogmetETfgIkTpv94iWsNlhve7fbJpwZjouUxgQfskJCeu6LzvBaN-rWicia1ZuK7eAoV5sFwFJdAGE-G8P-MOfnHLGZH8ki6s8TWpMyFKSxDWxNAp0mV5G7o7fXT157OrqTie0JKDJdaxVzv9CnwrCqU9kkYwqZfsB_YoRJyhzWk91qfx-Y"
update_env "NEXT_PUBLIC_META_PIXEL_ID" "1415925426594662"

echo "Concluído!"
