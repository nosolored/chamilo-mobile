Chamilo LMS Mobile app
================================

Instalación
-----------------------------

Primero, instalar Apache Cordova en tu equipo https://cordova.apache.org/

Clonar este repositorio:
```
git clone git@github.com:nosolored/chamilo-mobile.git
cd chamilo-mobile
```

Añadir la plataforma Android y los plugins necesarios

```
cordova platform add android@10.1.2
cordova platform add android@9.0.0

Android 13 (nivel de API 33)
Android 12 (niveles de API 31 y 32)
Android 11 (nivel de API 30)
Android 10 (nivel de API 29)

En config.xml según corresponda
<preference name="android-targetSdkVersion" value="32" />
<preference name="android-targetSdkVersion" value="31" />
<preference name="android-targetSdkVersion" value="30" />
<preference name="android-targetSdkVersion" value="29" />

cordova platform add browser
cordova run browser
para testear en navegador
```

```
cordova platform add android
Para Android 12: cordova platform add android@11

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

o 
cordova plugin add cordova-plugin-device && cordova plugin add cordova-plugin-dialogs && cordova plugin add cordova-plugin-file && cordova plugin add cordova-plugin-file-transfer && cordova plugin add cordova-plugin-inappbrowser && cordova plugin add cordova-plugin-network-information && cordova plugin add cordova-plugin-screen-orientation && cordova plugin add cordova-plugin-spinner && cordova plugin add cordova-plugin-splashscreen && cordova plugin add cordova-plugin-whitelist && cordova plugin add cordova-plugin-zip && cordova plugin add cordova-plugin-cache-clear && cordova plugin add cordova-plugin-android-permissions && cordova plugin add cordova-plugin-filechooser && cordova plugin add cordova-plugin-filepath && cordova plugin add cordova-plugin-pdialog && cordova plugin add cordova-plugin-file-opener2

Android 12 (si no existe el fichero package.json previamente):
cordova plugin add cordova-plugin-device && cordova plugin add cordova-plugin-dialogs && cordova plugin add cordova-plugin-file && cordova plugin add cordova-plugin-file-transfer && cordova plugin add cordova-plugin-inappbrowser && cordova plugin add cordova-plugin-network-information && cordova plugin add cordova-plugin-screen-orientation && cordova plugin add cordova-plugin-spinner && cordova plugin add cordova-plugin-zip && cordova plugin add cordova-plugin-cache-clear && cordova plugin add cordova-plugin-android-permissions && cordova plugin add cordova-plugin-filechooser && cordova plugin add cordova-plugin-filepath && cordova plugin add cordova-plugin-pdialog


cordova plugin add cordova-support-google-services --save 
+ info: Cordova plugin to add support for google services
As part of enabling Google APIs or Firebase services in your Android application you may have to add the google-services plugin to your build.gradle file.
https://www.npmjs.com/package/cordova-support-google-services
https://developers.google.com/android/guides/google-services-plugin

Para Android 12 | Para compilar con Apache Cordova es necesario remover plugins:
cordova plugin remove cordova-plugin-whitelist
cordova plugin remove cordova-plugin-file-opener2
cordova plugin remove cordova-plugin-splashscreen
cordova plugin remove phonegap-plugin-push
cordova plugin remove cordova-support-google-services

```

Si se desea utilizar el sistema de notificaciones:
```
cordova plugin add phonegap-plugin-push
Nota para Android 12: 
El plugin phonegap-plugin-push (https://github.com/phonegap/phonegap-plugin-push) está descatalogado.

Utilizar https://github.com/havesource/cordova-plugin-push/blob/master/docs/INSTALLATION.md

cordova plugin add github:havesource/cordova-plugin-push

Información adicional:
https://ionic.zendesk.com/hc/en-us/articles/7891143965975-Migrating-to-Cordova-Android-11
https://volt.build/docs/android_12/

``` 
Es necesario tener en la raíz del proyecto el fichero google-services.json
Para generarlo debes crear un proyecto en https://console.firebase.google.com/u/0/?pli=1 

En Firebase, una vez creado el proyecto para descargare el archivo google-services.json hay que seguir las instrucciones indicadas aquí:
Cómo descargar un archivo de configuración 
https://support.google.com/firebase/answer/7015592?hl=es#zippy=%2Cen-este-art%C3%ADculo

En el fichero config.xml está añadida la linea necesaria para las notificaciones:
```
<resource-file src="google-services.json" target="app/google-services.json" />
```
En caso de no usar notificaciones deberá eliminarla.

Nota:
Se debe editar la cadena org.chamilo.app que aparece en el fichero config.xml y sustituirlo por el que se haya creado en google-services.json
Si no se hace dará un error Apache Cordova.

El fichero google-services.json debe copiarse a la ruta ../platforms/android/app/google-services.json para que no muestre error Cordova al compilar.

Construir el APK de Android

```
cordova build android
```

Ejecutar sobre un dispositivo Android

```
cordova run android
```
En tu aula virtual Chamilo LMS:

* El contenido de la carpeta "chamilo_app" debe ser copiada en el directorio plugin de la plataforma (plugins/chamilo_app).
* Para poder visualizar las imágenes de las secciones de mensajes, descripción, anuncios y foros, debes modificar el fichero .htaccess de la carpeta "courses".
```
RewriteCond %{HTTP_USER_AGENT} !android [NC]
RewriteRule ([^/]+)/document/(.*)$ /main/document/download.php?doc_url=/$2&cDir=$1 [QSA,L]
```
