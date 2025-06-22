# generate-structure.ps1

param(
    [string]$Root = "."
)

# 1. Se placer à la racine du projet
Set-Location -Path $Root

# 2. Création des fichiers à la racine
$rootFiles = @(
    ".env.local",
    ".env.example",
    ".gitignore",
    "next.config.js",
    "package.json",
    "tailwind.config.js",
    "postcss.config.js",
    "README.md",
    "docker-compose.yml"
)
foreach ($f in $rootFiles) {
    New-Item -Path $f -ItemType File -Force | Out-Null
}

# 3. Création des dossiers
$dirs = @(
    "src\app\auth\signin",
    "src\app\auth\signup",
    "src\app\dashboard",
    "src\app\chat\[sessionId]",
    "src\app\api\auth\signin",
    "src\app\api\auth\signup",
    "src\app\api\chat\[sessionId]",
    "src\app\api\chat\sessions",
    "src\app\api\chat\webhook",
    "src\app\sse\[sessionId]",
    "src\components\ui",
    "src\components\auth",
    "src\components\chat",
    "src\components\dashboard",
    "src\components\layout",
    "src\lib",
    "src\types"
)
foreach ($d in $dirs) {
    New-Item -Path $d -ItemType Directory -Force | Out-Null
}

# 4. Fichiers dans src/app
$appFiles = @(
    "src\app\globals.css",
    "src\app\layout.tsx",
    "src\app\page.tsx",
    "src\app\auth\signin\page.tsx",
    "src\app\auth\signup\page.tsx",
    "src\app\dashboard\page.tsx",
    "src\app\chat\[sessionId]\page.tsx",
    "src\app\api\auth\signin\route.ts",
    "src\app\api\auth\signup\route.ts",
    "src\app\api\chat\[sessionId]\route.ts",
    "src\app\api\chat\sessions\route.ts",
    "src\app\api\chat\webhook\route.ts",
    "src\app\sse\[sessionId]\route.ts"
)
foreach ($f in $appFiles) {
    New-Item -Path $f -ItemType File -Force | Out-Null
}

# 5. Fichiers dans src/components
$compFiles = @(
    "src\components\ui\Button.tsx",
    "src\components\ui\Input.tsx",
    "src\components\ui\Card.tsx",
    "src\components\auth\SignInForm.tsx",
    "src\components\auth\SignUpForm.tsx",
    "src\components\chat\ChatInterface.tsx",
    "src\components\chat\MessageList.tsx",
    "src\components\chat\MessageInput.tsx",
    "src\components\dashboard\SessionsList.tsx",
    "src\components\layout\Header.tsx",
    "src\components\layout\Navigation.tsx"
)
foreach ($f in $compFiles) {
    New-Item -Path $f -ItemType File -Force | Out-Null
}

# 6. Fichiers dans src/lib, src/types et middleware
$otherFiles = @(
    "src\lib\auth.ts",
    "src\lib\redis.ts",
    "src\lib\jwt.ts",
    "src\lib\utils.ts",
    "src\types\auth.ts",
    "src\types\chat.ts",
    "src\middleware.ts"
)
foreach ($f in $otherFiles) {
    New-Item -Path $f -ItemType File -Force | Out-Null
}

Write-Host "✅ Arborescence Next.js Chat App créée avec succès !"
