# ================================
# DEPLOY AUTOMATICO PLANEJEJA
# ================================

$ServerUser = "root"
$ServerHost = "46.202.151.82"
$ServerDeployScript = "/root/docker/deploy.sh"

Write-Host ""
Write-Host "===== PREPARANDO COMMIT (CONVENTIONAL COMMITS) =====" -ForegroundColor Cyan
Write-Host ""

# ----------- TYPE ------------
Write-Host "Tipos disponiveis:"
Write-Host "  feat     = nova funcionalidade"
Write-Host "  fix      = correcao de bug"
Write-Host "  chore    = manutencao/ajustes"
Write-Host "  docs     = documentacao"
Write-Host "  refactor = refatoracao"
Write-Host "  style    = estilo/formatacao"
Write-Host ""

$type = Read-Host "Digite o type (ex: feat, fix, chore)"

if ([string]::IsNullOrWhiteSpace($type)) {
    Write-Host "Type obrigatorio. Cancelando." -ForegroundColor Red
    exit 1
}

# ----------- SCOPE ------------
$scope = Read-Host "Digite o scope (ex: home, ui, menu) ou deixe vazio"

# ----------- SUBJECT ------------
$subject = Read-Host "Digite o subject (resumo curto da mudanca)"

if ([string]::IsNullOrWhiteSpace($subject)) {
    Write-Host "Subject obrigatorio. Cancelando." -ForegroundColor Red
    exit 1
}

# Deixar o subject comeca com minuscula
if ($subject.Length -gt 1) {
    $subject = $subject.Substring(0,1).ToLower() + $subject.Substring(1)
}

# ----------- MONTAR MENSAGEM -----------

if ([string]::IsNullOrWhiteSpace($scope)) {
    $commitMsg = "$type`: $subject"
} else {
    $commitMsg = "$type`($scope`)`: $subject"
}

Write-Host ""
Write-Host "Mensagem de commit criada:" -ForegroundColor Yellow
Write-Host "  $commitMsg" -ForegroundColor Green
Write-Host ""

$confirm = Read-Host "Confirmar commit? (s/N)"
if ($confirm.ToLower() -ne "s") {
    Write-Host "Commit cancelado." -ForegroundColor Yellow
    exit 0
}

# ================================
# GIT COMMIT & PUSH
# ================================

Write-Host ""
Write-Host "===== COMMIT E PUSH =====" -ForegroundColor Cyan

git add -A

$changes = git diff --cached --name-only

if (-not $changes) {
    Write-Host "Nenhuma alteracao para commit. Deploy cancelado." -ForegroundColor Yellow
    exit 0
}

git commit -m "$commitMsg"
git push

# ================================
# EXECUTAR DEPLOY NO SERVIDOR
# ================================

Write-Host ""
Write-Host "===== ENVIANDO DEPLOY PARA O SERVIDOR =====" -ForegroundColor Cyan

ssh "$ServerUser@$ServerHost" "$ServerDeployScript"

Write-Host ""
Write-Host "===== DEPLOY FINALIZADO =====" -ForegroundColor Green
Write-Host ""
