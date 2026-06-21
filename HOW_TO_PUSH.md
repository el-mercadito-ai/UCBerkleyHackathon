# 🚀 CÓMO HACER PUSH A GITHUB

## Opción 1: Ejecutar el script (RECOMENDADO)

1. Ve al explorador de archivos (ya está abierto)
2. Busca el archivo: **PUSH_TO_GITHUB.bat**
3. Doble clic en el archivo
4. Ingresa tus credenciales de GitHub cuando te lo pida

## Opción 2: Línea de comandos

```bash
cd C:\Users\simular\AppData\Roaming\simular-unified-ui\SimularFiles\UCBerkleyHackathon
git push -u origin diego/frontend-marketplace
```

## Si no tienes Git configurado:

### Configurar credenciales:
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### Usar Personal Access Token:
1. Ve a: https://github.com/settings/tokens
2. Clic en "Generate new token (classic)"
3. Selecciona scope: **repo** (full control)
4. Copia el token
5. Cuando git te pida password, pega el token

## Verificar que funcionó:

Después del push, ve a:
https://github.com/pecezon/UCBerkleyHackathon/tree/diego/frontend-marketplace

Deberías ver todos los archivos ahí.

---

## ¿Qué se va a pushear?

- ✅ 2 commits con 19 archivos
- ✅ Monorepo completo (web + orchestrator + shared)
- ✅ Toda la documentación
- ✅ 804+ líneas de código

## Rama: diego/frontend-marketplace

Después puedes hacer un Pull Request para mergear a main.
