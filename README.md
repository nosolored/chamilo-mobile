Chamilo LMS Mobile app
================================

Instalación
-----------------------------

Primero, clonar este repositorio

```
git clone git@github.com:nosolored/chamilo-mobile.git
cd chamilo-mobile
```

Añadir la plataforma Android y los plugins necesarios

```
cordova platform add android
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-dialogs
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-file-transfer
cordova plugin add cordova-plugin-inappbrowser
cordova plugin add cordova-plugin-network-information
cordova plugin add cordova-plugin-screen-orientation
cordova plugin add cordova-plugin-spinner
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-zip
cordova plugin add cordova-plugin-cache-clear
cordova plugin add cordova-plugin-android-permissions
cordova plugin add cordova-plugin-filechooser
cordova plugin add cordova-plugin-filepath
cordova plugin add cordova-plugin-pdialog
cordova plugin add cordova-plugin-file-opener2

```

Si se desea utilizar el sistema de notificaciones:
```
cordova plugin add phonegap-plugin-push
``` 
Es necesario tener en la raíz del proyecto el fichero google-services.json
Para generarlo debes crear un proyecto en https://console.firebase.google.com/u/0/?pli=1 
En el fichero config.xml está añadida la linea necesaria para las notificaciones:
```
<resource-file src="google-services.json" target="app/google-services.json" />
```
En caso de no usar notificaciones deberá eliminarla



Construir el APK de Android

```
cordova build android
```

Ejecutar sobre un dispositivo Android

```
cordova run android
```

* La carpeta "chamilo-app" debe ser copiada en el directorio plugin de la plataforma chamilo.
* Para poder visualizar las imágenes de las secciones de mensajes, descripción, anuncios y foros, debemos modificar el fichero .htaccess de la carpeta "courses".
```
RewriteCond %{HTTP_USER_AGENT} !android [NC]
RewriteRule ([^/]+)/document/(.*)$ /main/document/download.php?doc_url=/$2&cDir=$1 [QSA,L]
```
