# ============================
#  DEPLOY AUTOMÁTICO PLANEJEJÁ
#  Executar no VSCode:  .\deploy-planejeja.ps1
# ============================

$ServerUser = "root"
$ServerHost = "46.202.151.82"
$ServerDeployScript = "/root/docker/deploy.sh"

Write-Host "`n===== COMMIT & PUSH =====" -ForegroundColor Cyan

# Perguntar a mensagem de commit
$commitMsg = Read-Host "Digite a mensagem do commit"

git add -A
git commit -m "$commitMsg"
git push

Write-Host "`n===== ENVIANDO DEPLOY PARA O SERVIDOR =====" -ForegroundColor Cyan

ssh "$ServerUser@$ServerHost" "$ServerDeployScript"

Write-Host "`n===== DEPLOY FINALIZADO! =====" -ForegroundColor Green
