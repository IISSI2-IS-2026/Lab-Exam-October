# Rúbrica — Examen de laboratorio «Riders» (octubre 2026)

> Versión en Markdown del documento publicado a los estudiantes. El original se editó en Claude Docs.

## Cómo leer esta rúbrica

Tu nota es la suma de 21 apartados con las puntuaciones que fija el enunciado (README) del examen: 4,5 puntos de backend y 5,5 de frontend. Si esta rúbrica y el README discreparan, prevalece el README.

| Bloque | Ejercicio | Puntos |
| --- | --- | --- |
| Backend | 1. Migraciones y modelos | 1 |
| Backend | 2. Enrutamiento, middlewares y validación | 2 |
| Backend | 3. Controladores | 1,5 |
| Frontend | 4. Pantalla «Restaurant Orders» (Owner) | 1,5 |
| Frontend | 5. Pantalla «My Orders» (Rider) | 2,5 |
| Frontend | 6. Fidelidad estética | 1,5 |
| | **Total** | **10** |

Cada apartado parte de su puntuación máxima y cada error resta una cantidad fija, la misma para todos los estudiantes. Las secciones de backend y frontend detallan qué se pide en cada ejercicio, qué errores restan y cuánto.

En Enseñanza Virtual recibirás un comentario que recorre los seis ejercicios: para cada uno, la nota obtenida, en qué te has equivocado y cuánto resta cada error. Comentario y rúbrica juntos justifican cada punto.

## Cómo se resta

Cada apartado vale lo que fija el enunciado, y cada error resta una parte de ese valor:

- **Un cuarto** si es un detalle secundario: un mensaje, un dato menor, un caso límite o un valor por defecto.
- **La mitad** si falta una parte sustancial, o si un planteamiento correcto deja de funcionar por un único error.
- **Tres cuartos** si el intento no funciona por un planteamiento erróneo.
- **Todo el apartado** si no está hecho o no hay nada aprovechable.

Las restas se dan en centésimas, truncadas a favor del estudiante. Por ejemplo, un cuarto de un apartado de 0,75 son 0,1875 puntos, y resta 0,18.

El ejercicio 6 se puntúa por elementos (cada icono o color que falta resta lo indicado en su sección). Un mismo error resta lo mismo a todos.

**Reglas comunes**

1. **Varios errores en un mismo apartado.** Se aplica la resta mayor, salvo las excepciones que se indican en cada ejercicio. Un apartado nunca resta más de lo que vale.
2. **Un mismo error no resta dos veces por sus efectos en cadena.** Se descuenta en el criterio donde se origina. Si impide comprobar un criterio posterior, se neutraliza hipotéticamente ese error (por ejemplo, usando el identificador correcto o abriendo el formulario) y se evalúa el resto del código. Solo se aplica otra resta si se encuentra un defecto independiente en ese criterio.
3. **Fallos que impiden usar el resto del frontend.** El enunciado dice que *«solo se valorará aquello que pueda ser utilizado tal y como lo haría un usuario final»*. El profesorado ha decidido aplicarlo solo al criterio donde se origina el fallo. Si una app no compila, la lista de pedidos no carga o un botón no abre el cuadro, ese fallo resta en su criterio. Lo que depende de él no vale cero automáticamente: se evalúa sobre el código, neutralizando hipotéticamente el fallo inicial, y solo restan sus defectos propios. En fidelidad estética, lo que queda oculto por ese fallo se comprueba en el código. Lo que no está implementado sí resta, porque la interfaz se parece menos a las capturas.
4. **Las elecciones que el enunciado deja abiertas no restan.** Por ejemplo, el tipo de `deliveryCode` (cadena o numérico) o los nombres de las funciones nuevas.
5. **Los cambios solo de formato en ficheros proporcionados** (espacios, saltos de línea o comentarios en `FormModal.js`, por ejemplo) no cuentan como modificación.

## Backend (4,5 puntos)

### Ejercicio 1. Migraciones y modelos (1 punto)

#### Qué se pide

- Migraciones (0,6): ownerApprove (booleano, por defecto cierto) y deliveryCode en Order; isQualifiedRider (booleano, por defecto cierto) en User. Sin cambiar nombres ni otros campos.
- Modelos (0,4): los mismos campos en Order y User, coherentes con las migraciones.

#### Errores y lo que restan

**Migraciones (0,6)**

- En ownerApprove o en isQualifiedRider falta el valor por defecto cierto que exige el enunciado (no se pone, o está mal escrito y Sequelize lo ignora sin avisar), o ownerApprove tiene false por defecto, lo contrario de lo pedido: −0,15.
- La migración aborta y no se crea ninguna tabla, por un error de sintaxis o por un tipo que no existe, como `Sequelize.BOOL` en lugar de `Sequelize.BOOLEAN`: −0,45.
- El seeder de usuarios falla y la base de datos queda vacía, porque la columna de Users no se llama isQualifiedRider o porque se crea con `allowNull: false` y sin valor por defecto (los seeders solo le dan valor en el rider). Fallan el registro y el login: −0,45.
- ownerApprove e isQualifiedRider se crean como STRING, aunque el modelo los declara BOOLEAN. La base de datos guarda «1» o «0», y «0» es verdadero en JavaScript, así que desaprobar o inhabilitar no tiene efecto: −0,45.

**Modelos (0,4)**

- En ownerApprove (Order) o en isQualifiedRider (User) falta el valor por defecto cierto que exige el enunciado (no se pone, o está mal escrito y Sequelize lo ignora sin avisar), o ownerApprove tiene false por defecto, lo contrario de lo pedido: −0,1.
- isQualifiedRider no está en el modelo User. La aplicación ni lo lee ni lo guarda, no se puede inhabilitar a ningún rider (409) y el login no lo devuelve, así que la app del rider lo mostraría inhabilitado: −0,2.
- El backend no arranca, por un error de sintaxis en el modelo o por un tipo que no existe, como `DataTypes.BOOL` en lugar de `DataTypes.BOOLEAN`: −0,3.
- El campo de Order no se llama ownerApprove, como la columna de la migración, y toda consulta de pedidos da 500; o isQualifiedRider tiene `allowNull: false` y no tiene valor por defecto en User, y como ningún formulario lo envía se rechazan todos los registros (422): −0,3.
- Se sustituye un campo existente de User (phone) por isQualifiedRider, cuando el enunciado pide no modificar los campos existentes: −0,3.

#### Cómo se combinan los errores

Cada apartado se valora sobre sus dos ficheros, el de Order y el de User. Si hay varios errores, se aplica la resta mayor. La excepción son dos errores leves distintos (de los que restan 0,15 en migraciones o 0,1 en modelos): juntos restan la mitad del apartado, 0,3 en migraciones y 0,2 en modelos. Los errores en los valores por defecto (que falte el de ownerApprove o el de isQualifiedRider, o que ownerApprove tenga false) cuentan juntos como un solo error leve, aunque afecten a los dos campos. El tipo de deliveryCode (cadena o número) no resta.

### Ejercicio 2. Enrutamiento, middlewares y validación (2 puntos)

#### Qué se pide

- Rutas nuevas (0,5): `PATCH /orders/:orderId/toggleApprove` y `PATCH /orders/rider/:riderId/disqualify`, con los middlewares que producen los códigos de RF2 y RF4.
- Ruta de entrega (0,5): añadir checkDeliveryCode, en una posición correcta, a la ruta `riderDeliver/:deliveryCode`, que ya venía hecha.
- Middleware checkApprovedDeliveries (0,5): 409 salvo que el rider tenga al menos dos pedidos entregados en los últimos siete días con ownerApprove falso.
- Middleware checkDeliveryCode (0,5): 409 si el código de la URL no coincide con el deliveryCode del pedido.

#### Errores y lo que restan

**Rutas nuevas (0,5)**

- Falta en su ruta uno de los middlewares necesarios: checkOrderOwnership en toggleApprove (cualquier owner aprueba pedidos de restaurantes ajenos, sin el 403; los tests proporcionados no lo detectan), checkRiderIsQualified en disqualify (no hay 409 si el rider ya está inhabilitado) o checkApprovedDeliveries en disqualify (está implementado, pero no se encadena o se pone en otra ruta): −0,12.
- El verbo o el path no coinciden con los del enunciado (erratas, otro verbo o la ruta colgada de otra existente), así que el endpoint no existe (404) o no se puede alcanzar: −0,25.
- checkEntityExists recibe un modelo o un parámetro que no corresponde a la ruta (p. ej. Order y 'orderId' en disqualify, que solo tiene :riderId), o se encadena un middleware que no corresponde y bloquea siempre al owner (p. ej. checkOrderIsAssignedToRider en toggleApprove, o middlewares que necesitan :orderId en disqualify). La ruta responde siempre 403 o 404: −0,25.
- Un middleware de estado rechaza casos válidos. toggleApprove usa checkOrderIsPending, checkOrderCanBeAccepted o checkOrderCanBeSent en lugar de checkOrderNotPendingNotAvailable (409 en pedidos aceptados o entregados), o se invierte la condición del checkRiderIsQualified proporcionado (un rider habilitado nunca puede inhabilitarse): −0,25.
- La ruta no termina en el controlador pedido (OrderController.toggleApprove u OrderController.disqualifyRider). No hay controlador, se usa otro (500) o uno inexistente, con el que Express falla y deja de cargar el resto de OrderRoutes.js: −0,25.
- En las dos rutas, hasRole recibe un rol distinto de 'owner' o se encadenan varios hasRole. El owner recibe 403 y, según el caso, otros roles sí acceden: −0,37.

**Ruta de entrega (0,5)**

- checkDeliveryCode sustituye a checkOrderCanBeDeliveredByRider en lugar de añadirse. Se comprueba el código, pero se pierden el 403 (pedido de otro rider) y los 409 (pedido no enviado o ya entregado): −0,25.
- La ruta usa un middleware que no existe en OrderMiddleware (el exportado se llama checkDeliveryCode). Express falla al registrar la ruta y OrderRoutes.js deja de cargar desde ese punto: −0,37.
- Se mantiene la ruta original y se declara otra con el mismo verbo y path que sí lleva checkDeliveryCode. Express atiende siempre la primera, así que el código nunca se comprueba: −0,37.
- Se reescribe la ruta (roles encadenados que nadie cumple, sin checkOrderCanBeDeliveredByRider u otro controlador) y ningún rider puede entregar. Solo había que añadir checkDeliveryCode a la ruta existente: −0,37.
- No está hecho: checkDeliveryCode no se añade a la ruta (sin cambios o comentado): −0,5.

**Middleware checkApprovedDeliveries (0,5)**

- No se filtran los últimos siete días (lastWeek se calcula, pero no se usa en la consulta), así que cuentan las entregas no aprobadas de cualquier fecha: −0,12.
- Se cuentan los pedidos con ownerApprove falso creados en los últimos siete días (createdAt), cuando el enunciado pide los entregados en ese plazo (deliveredAt). Entran pedidos sin entregar y el plazo se mide con la fecha equivocada. Los tests proporcionados no lo detectan: −0,25.
- El planteamiento es completo (pedidos del rider entregados en los últimos siete días con ownerApprove falso, umbral de dos y 409), pero errores de programación impiden que funcione, como la falta de un await, un campo u operador incorrecto o un next() sin return: −0,25.
- El conteo no responde al requisito. Faltan condiciones esenciales (ownerApprove falso, pedido entregado, últimos siete días), alguna está invertida, se filtra por el usuario que ha iniciado sesión o se busca un :orderId que la ruta no tiene: −0,37.
- No está hecho: middleware vacío, comentado o que solo llama a next(). Si está vacío y encadenado, la petición queda sin respuesta: −0,5.

**Middleware checkDeliveryCode (0,5)**

- Compara el deliveryCode del pedido con el código recibido y responde 409, pero un error puntual anula la comparación: lee el código del body en lugar de req.params.deliveryCode, falta un await o un campo está mal escrito. Rechaza también el código correcto o acepta cualquiera: −0,25.
- No compara el deliveryCode del pedido con el parámetro de la URL. Solo comprueba que exista, lo compara con una constante, busca cualquier pedido con ese código, invierte la lógica o no llama a next(): −0,37.
- No está hecho: no existe el middleware checkDeliveryCode: −0,5.

#### Cómo se combinan los errores

En las rutas nuevas, cada ruta se valora por separado y el apartado se queda con la media, redondeada hacia abajo a cuartos del apartado (entero, tres cuartos, mitad, un cuarto o nada). Las restas de la lista son las del apartado cuando el error está en una sola ruta y la otra está bien; si fallan las dos, se aplica la media. Por ejemplo, una ruta correcta y otra que solo vale un cuarto dejan el apartado en la mitad (−0,25).

En la ruta de entrega y en los dos middlewares, si hay varios errores se aplica la resta mayor. Si son dos errores independientes, se resta además una cuarta parte del apartado (0,12), pero con un intento pertinente nunca se pierden más de tres cuartos del apartado (0,37).

### Ejercicio 3. Controladores (1,5 puntos)

#### Qué se pide

- Controlador toggleApprove (0,75): invierte ownerApprove, guarda y devuelve el pedido (200).
- Controlador disqualifyRider (0,75): pone isQualifiedRider a falso, guarda y devuelve el rider (200).

#### Errores y lo que restan

**Controlador toggleApprove (0,75)**

- Invierte y guarda bien ownerApprove, pero responde solo con el booleano en lugar del pedido; o no tiene try/catch y, si se produce un error, la petición queda sin respuesta: −0,18.
- Busca el pedido, lo guarda y lo devuelve, pero un error puntual impide invertir ownerApprove: invierte un valor del body, escribe en un campo inexistente, lo deja siempre en true o falta un await: −0,37.
- No invierte el ownerApprove del pedido. Asigna un valor fijo o un parámetro inexistente, opera sobre un usuario en vez de sobre el pedido, no modifica ni guarda nada, o combina mal Order.update y save: −0,56.
- Función vacía, que no responde y deja la petición colgada: −0,75.

**Controlador disqualifyRider (0,75)**

- Responde solo con el booleano isQualifiedRider en lugar del usuario rider; o no tiene try/catch y, si se produce un error, la petición queda sin respuesta: −0,18.
- Busca un User, pone un campo a false, lo guarda y lo devuelve, pero un error puntual lo anula: el id sale de un parámetro inexistente o de req.user (y se inhabilita al owner que ha iniciado sesión), el campo es otro o falta un await: −0,37.
- No pone isQualifiedRider a false en el usuario rider. Busca y modifica un pedido (Order) o un modelo Rider que no existe, o actualiza con el body (vacío) o sobre la tabla de pedidos, sin devolver el usuario: −0,56.
- Función vacía, que no responde y deja la petición colgada: −0,75.

#### Cómo se combinan los errores

Si hay varios errores en un controlador, se aplica la resta mayor. Si son dos errores independientes, se resta además una cuarta parte del apartado (0,18), pero con un intento pertinente nunca se pierden más de tres cuartos del apartado (0,56).

## Frontend (5,5 puntos)

### Ejercicio 4. Pantalla «Restaurant Orders» (1,5 puntos)

#### Qué se pide

- Carga de pedidos (0,2): cargar los pedidos del restaurante; si falla, mensaje de error y lista vacía.
- Tarjeta del pedido (0,4): cada tarjeta muestra, en dos columnas, la dirección y el CP del restaurante, el cliente, el precio, los comentarios del rider, los comentarios del cliente y la leyenda de aprobación.
- Botones del pedido (0,3): los botones de acción solo aparecen en pedidos aceptados por un rider, y la navegación a las entregas del rider funciona.
- Aprobar y desaprobar (0,4): botón «Approve» o «Disapprove» según ownerApprove. Al pulsarlo, mensaje de éxito y lista recargada; si falla, mensaje de error y sin cambios.
- Endpoints (0,2): `GET restaurants/:id/orders` y `PATCH orders/:id/toggleApprove`, exportados.

#### Errores y lo que restan

**Carga de pedidos (0,2)**

- Los pedidos nunca llegan a verse y solo funciona el mensaje de error, porque fetchOrders llama a otra función o endpoint (o a una función no importada) o porque no pasa el id del restaurante (route.params.id) y pide `restaurants/undefined/orders`: −0,15. Si la pantalla es correcta y lo que falla es la URL del GET en RestaurantEndpoints.js, resta solo en «Endpoints».
- La petición y la gestión del error son correctas, pero la pantalla no muestra los pedidos porque una llave sin cerrar en fetchOrders deja dentro de esa función el return de la pantalla: −0,15. Si la pantalla queda en blanco por un fallo al pintar la tarjeta, resta solo en «Tarjeta del pedido».
- No está hecho (fetchOrders vacía, sin petición ni mensaje de error), o la app del owner no compila por un error en OrdersScreen.js: −0,2.

**Tarjeta del pedido (0,4)**

- Falta uno de los seis datos, se sustituye por otro o no se ve (p. ej. la dirección del cliente en lugar de la del restaurante, o los gastos de envío en lugar de la leyenda de aprobación); o un dato está incompleto o mal rotulado (dirección sin código postal, cliente no identificado por su firstName, comentario con el rótulo equivocado o una línea de estado que no corresponde): −0,1.
- Faltan dos o tres de los seis datos o son erróneos, por ejemplo la dirección y el CP del restaurante, el nombre del cliente, comentarios sin valor o una leyenda que no refleja ownerApprove: −0,2.
- Solo se ve algún dato suelto, porque faltan cuatro o más de los seis; o los datos se pintan en blanco sobre la tarjeta blanca, sin rótulos y sin el restaurante, el nombre del cliente ni la leyenda de aprobación: −0,3.
- El código de la tarjeta lanza una excepción al pintarse (propiedades de null o undefined, como el rider de un pedido sin rider, o identificadores no declarados) y deja la pantalla en blanco: −0,4.
- No está hecho (la tarjeta no pinta ningún dato del pedido: columnas vacías, texto literal en lugar de valores o referencias a funciones), o la tarjeta no muestra los datos por un error propio al pintarlos: −0,4. Si la causa es un fallo de carga ya descontado en «Carga de pedidos», se evalúa la tarjeta suponiendo corregida esa carga.

**Botones del pedido (0,3)**

- La condición no es «aceptado por un rider» (p. ej. `status !== 'pending'`) y los botones salen también en pedidos en preparación sin rider; o solo el botón de aprobar o desaprobar depende del rider, y «View … deliveries» sale en todos los pedidos y, en los que no tienen rider, lleva a un rider nulo: −0,07.
- El botón de aprobar o desaprobar se añade (o se intenta añadir) sin condición, así que los botones salen en todos los pedidos, también en los pendientes y en preparación sin rider. La navegación a RiderDeliveries funciona: −0,15.
- La información desborda la tarjeta y el botón «View … deliveries» de cada pedido queda tapado por la tarjeta siguiente. Solo se puede pulsar el del último pedido: −0,22.
- Se elimina o se reutiliza el botón de navegación proporcionado (hace otra cosa o falla en pedidos sin rider). No se puede llegar a RiderDeliveries y tampoco hay condición de visibilidad: −0,3.
- No está hecho: la zona de botones sigue como en el código de partida, con «View … deliveries» en todos los pedidos, sin condición de visibilidad y sin botón de aprobar o desaprobar: −0,3.

**Aprobar y desaprobar (0,4)**

- Cuando el cambio de aprobación tiene éxito, no se muestra el mensaje de éxito: −0,1.
- El texto del botón no depende de ownerApprove (siempre el mismo rótulo, o los dos botones a la vez), o tras alternar no se recarga la lista (no se llama a fetchOrders, o se sustituye la lista por la respuesta): −0,2.
- El botón se ve y se puede pulsar, pero la aprobación nunca cambia por un fallo de la pantalla: llama a una función que no existe entre las importadas (TypeError), le pasa un argumento distinto del id del pedido (URL inválida, 404) o navega a RiderDeliveries en lugar de alternar: −0,3. Si el fallo está en el endpoint (URL o verbo erróneos, o no se exporta), resta solo en «Endpoints».
- El manejador se ejecuta al pintar el pedido (`onPress={handleToogle(item)}`) en lugar de al pulsar (`onPress={() => handleToogle(item)}`). Con el endpoint correcto, todo pedido desaprobado se volvería a aprobar solo: −0,3.
- No hay ningún botón Approve/Disapprove reconocible y pulsable implementado en el código. Hay código para el toggle, pero el botón no se pinta (decideButton vacío, no invocado o sin usar, o textos sin Pressable ni onPress); o se añade un Pressable vacío, sin texto visible o con otro rótulo, que no alterna la aprobación: −0,4. Si el botón no llega a la pantalla por un fallo ya descontado en otro criterio, se evalúa suponiendo corregido ese fallo.
- No está hecho (no hay manejador ni botón reconocible en el código): −0,4. Si no se puede probar el toggle por un fallo ya descontado en otro criterio, se evalúan el botón y su manejador suponiendo corregido ese fallo; los errores propios del toggle sí restan aquí.

**Endpoints (0,2)**

- Uno de los dos endpoints falla y el otro es correcto. La URL del GET es incorrecta (otro path, «restaurant» en singular o comillas simples que no interpolan `${id}`), o el PATCH falta, no se exporta, usa el verbo GET o tiene una URL incorrecta (errata en el path o «:» sobrante delante del id): −0,1.
- Las dos funciones existen y se exportan con el verbo correcto, pero ninguna URL es válida: «:» delante del id, parámetros sin interpolar, variables no declaradas o falta el return: −0,15.
- No está hecho (no se añade ningún endpoint a RestaurantEndpoints.js): −0,2. Los errores que impidan usar una pantalla no restan aquí si los endpoints están correctamente implementados y exportados.

#### Cómo se combinan los errores

Si hay varios errores en un apartado, se aplica la resta mayor. Un fallo de carga se descuenta en «Carga de pedidos»; los criterios de tarjeta, botones y toggle se evalúan suponiendo corregida esa carga. Los errores independientes de esos criterios sí restan. Los endpoints se puntúan por su implementación y exportación, no por fallos de la pantalla que los utiliza; y un endpoint erróneo resta solo en «Endpoints», no también en la carga o en el botón que lo usa.

### Ejercicio 5. Pantalla «My Orders» (2,5 puntos)

#### Qué se pide

- Pantalla y lista de pedidos (0,2): la pantalla «My Orders» se muestra y lista los pedidos (en el código de partida no se mostraba).
- Botón «Confirm delivery» (0,4): aparece en los pedidos recogidos y no entregados, y abre el cuadro de entrega.
- Cuadro FormModal (1,5): configurado para que se abra y se cierre, el campo recoja el código, cancelar no cambie nada, confirmar envíe el código y el campo esté vacío cada vez que se abre.
- Mensajes y recarga (0,2): tras la entrega, mensaje de éxito y lista actualizada; si falla, mensaje de error y pantalla sin cambios.
- Endpoint de entrega (0,2): `PATCH /orders/:orderId/riderDeliver/:deliveryCode`, exportado y usado.

#### Errores y lo que restan

**Pantalla y lista de pedidos (0,2)**

- La lista carga, pero fetchOrders hace además una petición con route.params.id, que no existe al entrar desde la pestaña, y tras cada carga se muestra un mensaje de error: −0,05.
- La app compila, pero la pantalla no se ve por un error en su propio fichero: estructura rota (p. ej. una llave sin cerrar deja el componente sin return) o un import con llaves de un export por defecto: −0,2.
- No está hecho (MyOrdersScreen.js sin cambios o solo con cambios de formato, y la pantalla sigue sin mostrarse porque usa `<FormModal />` sin importarlo), o la app del rider no compila por un error de sintaxis en MyOrdersScreen.js: −0,2. Los errores propios del botón o del formulario se puntúan en sus apartados, sin volver a restar aquí porque impidan mostrar la pantalla.

**Botón «Confirm delivery» (0,4)**

- Hay un botón de confirmar entrega visible, pero su propio manejador no abre el cuadro que pide el código: no hace nada, entrega sin pedir código o con uno fijo, llama a la recogida o navega a otra pantalla: −0,3. Si el manejador es correcto y el cuadro no se abre por un defecto del FormModal, se descuenta solo en el criterio del formulario.
- No está hecho (renderActionButton sigue devolviendo un Pressable vacío u otra cosa, o la pantalla no se tocó), o el propio botón no permite abrir el cuadro: −0,4. Si el cuadro queda inaccesible por un fallo del botón, el formulario se evalúa suponiendo corregido ese fallo.

**Cuadro FormModal (1,5)**

- El cuadro se abre según el estado y cancelar lo cierra, pero el campo no es editable o confirmar no envía el código escrito a través de handleDeliver, y además el campo no se vacía al abrirse: −1,12.
- El FormModal no recibe props que puedan funcionar (sin props, sin valor, booleanos o funciones ejecutadas donde van callbacks, `isVisible={true}` o errores de sintaxis). El cuadro no se puede cerrar ni confirmar por un error propio de su configuración, o rompe la pantalla: −1,5.
- La alternativa con Formik no funciona: el formulario no se muestra, no tiene botón de envío y su onSubmit se ejecuta al pintar y rompe la pantalla: −1,5.
- No está hecho (MyOrdersScreen.js sin cambios o solo de formato, o el `<FormModal />` comentado o eliminado sin ninguna alternativa para introducir el código de entrega): −1,5. Si el cuadro no se puede abrir por un fallo del botón ya descontado en su criterio, se evalúa su configuración suponiendo corregido ese fallo.

**Mensajes y recarga (0,2)**

- Hay mensaje de éxito, recarga y mensaje de error, pero los textos están copiados de otra acción (p. ej. la recogida) y no describen la entrega: −0,05.
- Tras una entrega correcta no se recarga la lista porque no se llama a fetchOrders, aunque haya mensajes de éxito y de error; o la lista se recarga, pero no hay mensaje de éxito y se llama a una variable de estado como si fuera una función, así que salta al catch y muestra un mensaje de error: −0,1.
- Solo se gestiona el fallo con un mensaje de error; no hay mensaje de éxito ni recarga de la lista: −0,15.
- No está hecho (handleDeliver vacío o pantalla sin tocar): −0,2. Los errores de conexión entre el botón, el cuadro y handleDeliver se descuentan en el criterio donde se origina cada error, sin volver a restar aquí por sus efectos en cadena.

**Endpoint de entrega (0,2)**

- El endpoint es correcto y se exporta, pero la pantalla nunca lo importa ni lo llama: −0,1.
- La URL del endpoint es errónea (el código va en el cuerpo y no en la ruta, parámetros literales sin interpolar, «:» sobrante u otro path), o se le pasa el pedido entero en lugar de su id: −0,15.
- No está hecho (no hay endpoint riderDeliver en OrderEndpoints.js, o se añade otro, como toggleApprove, que es del owner): −0,2. Si el endpoint está bien implementado y exportado, un fallo en la pantalla que impida alcanzarlo se descuenta en el criterio donde se origina, no también aquí.

#### Cómo se combinan los errores

Si hay varios errores en un apartado, se aplica la resta mayor. Los pasos forman una cadena, pero un fallo no anula automáticamente la puntuación de los pasos posteriores: cada uno se evalúa suponiendo corregidos los fallos previos, y se descuentan solo sus defectos propios. Si la lista carga porque se comentó, eliminó o sustituyó el `<FormModal />`, la carga no resta; el cuadro se valora en su propio apartado. Con la alternativa Formik, el ejercicio vale como máximo 1,5 puntos.

### Ejercicio 6. Fidelidad estética (1,5 puntos)

#### Qué se pide

- Colores (0,6): colores corporativos de GlobalStyles en lo nuevo. Hay cinco puntos de control de 0,12: botón Approve en brandGreen, Disapprove en brandPrimary, leyenda en brandGreen o brandPrimary según la aprobación, datos en brandBlue y Confirm delivery en brandGreen. Si uno se cumple a medias, vale la mitad (0,06).
- Iconos (0,6): los seis iconos de la tabla del enunciado que había que colocar, cada uno en su sitio, a 0,1 por icono: abacus en la leyenda, truck-delivery-outline, human-child, hand-okay, hand-pointing-down y package-variant-closed-check.
- Disposición (0,3): coherente con las capturas y con las pantallas existentes. Hay tres puntos de control de 0,1: tarjeta en dos columnas legibles, botones de aprobar y desaprobar con el estilo de la app y botón Confirm delivery con el estilo de la app. Si uno se cumple a medias, vale la mitad (0,05).

#### Errores y lo que restan

**Colores (0,6)**

- No hay un botón Approve reconocible con fondo brandGreen (brandGreenTap al pulsar), o no hay un botón Disapprove reconocible con fondo brandPrimary (brandPrimaryTap al pulsar). El botón falta, no tiene un rótulo identificable o usa otro color o uno que no existe en GlobalStyles: −0,12 por cada botón.
- No hay un botón Confirm delivery con fondo brandGreen (brandGreenTap al pulsar) en My Orders. La pantalla o el botón no existen, o el botón tiene otro color: −0,12.
- La leyenda «Delivery approved / disapproved by owner» no existe, o no usa brandGreen cuando está aprobado y brandPrimary cuando no (tiene otro color, el color por defecto, un color literal o blanco): −0,12.
- La leyenda usa un color corporativo correcto, pero fijo, que no cambia entre brandGreen y brandPrimary según ownerApprove: −0,06.
- Los datos y comentarios de la tarjeta no van en brandBlue: no están, van en blanco sobre la tarjeta blanca, en el color por defecto o con colores literales ajenos a GlobalStyles: −0,12.
- Solo una parte de los datos y comentarios (o de sus iconos) va en brandBlue; el resto usa el color por defecto, otro color corporativo, blanco o literales ajenos a GlobalStyles: −0,06.

**Iconos (0,6)**

- Un icono falta, es otro o no está en su sitio, también cuando el elemento que debe llevarlo no existe, o una errata en el nombre hace que se pinte «?». Son abacus en la leyenda de aprobación (no en otro dato), truck-delivery-outline en los comentarios del rider (no vale truck-delivery), human-child en los comentarios del cliente, hand-okay en el botón Approve, hand-pointing-down en el botón Disapprove y package-variant-closed-check en el botón Confirm delivery: −0,1 por icono.

**Disposición (0,3)**

- La tarjeta se ve, pero mal dispuesta: la segunda columna se sale en pantallas estrechas, los botones tapan parte de una columna (más que en las capturas), «View … deliveries» se sale de la tarjeta o hay una sola columna: −0,05.
- Los botones Approve y Disapprove se reconocen, pero con defectos de forma o colocación: apilados en vertical, tan anchos que desplazan «View … deliveries», dentro de una columna, o mostrados a la vez o junto a botones de más: −0,05.
- El botón Confirm delivery se ve, pero sin el estilo de botón de la app (sin padding ni bordes, como una franja de color) o desbordando la tarjeta: −0,05.
- La información de la tarjeta no se puede leer (sin datos, blanco sobre blanco, desbordada o tapada por los botones), o se altera el aspecto proporcionado (cabecera eliminada, ImageCard modificado): −0,1.
- No hay ningún botón reconocible como Approve o Disapprove (no está hecho, no se pinta, está vacío o su rótulo no lo identifica), o no hay un botón Confirm delivery (la pantalla del rider no está hecha o no tiene el botón): −0,1 por cada botón.

#### Cómo se combinan los errores

Se puntúa por elementos sobre las dos pantallas de las capturas, también la del rider aunque no se haya hecho el ejercicio 5. A diferencia del resto de ejercicios, aquí las restas se suman. Si un elemento no se ve por un fallo ya descontado en otro criterio (una lista que no carga, una pantalla que no compila), sus colores, iconos y disposición se comprueban en el código, suponiendo corregido ese fallo. Lo que no está implementado sí resta aquí, aunque también reste en su ejercicio: este ejercicio mide el parecido con las capturas, y un botón o un dato que falta es una diferencia con ellas.

## Sin penalizaciones adicionales

Aparte de las restas de cada apartado, no se aplica ninguna penalización adicional, porque el enunciado no las anuncia.

- **Romper funcionalidad que ya venía implementada** solo resta cuando impide un apartado evaluado, y entonces resta en ese apartado. Por ejemplo, quitar un middleware proporcionado de la ruta de entrega resta en la ruta de entrega.
- **Reimplementar algo que el enunciado pedía reutilizar** resta dentro del apartado correspondiente. La alternativa con Formik está permitida expresamente y tiene su propio tope (ejercicio 5).
- **Los tests y `FormModal.js` no podían modificarse.** Ninguna entrega modificó los tests, y los cambios en `FormModal.js` fueron solo de formato.

## Pruebas automáticas y recorrido de la aplicación

Todas las entregas se probaron con el mismo procedimiento y en el mismo entorno, para que ningún resultado dependa del ordenador de quien corrige. El número de tests superados no es la nota: es una de las evidencias con las que se asigna el nivel de cada apartado.

**Backend.** Se ejecutó la batería oficial `riderOrders.test.js` (69 tests) en un contenedor Docker con una base de datos MariaDB nueva. Siempre se usó la copia original de los tests, no la incluida en tu entrega. Cada backend se probó tres veces:

1. Tu backend tal cual lo entregaste.
2. Tu backend con las migraciones y modelos de la solución. Así se valoran tus rutas, middlewares y controladores (ejercicios 2 y 3) sin que un fallo de migraciones o modelos los arrastre.
3. Tus migraciones y modelos con las rutas, middlewares y controladores de la solución. Así se valoran tus migraciones y modelos (ejercicio 1) por sí solos.

**Frontend.** Cada aplicación (Owner y Rider) se compiló para web y se usó con un navegador, como lo haría un usuario, contra el backend de la solución. Así un fallo de tu backend no te resta también en el frontend. Los datos de prueba eran los de los seeders (`owner1@owner.com` y `rider1@rider.com`).

El recorrido fue el mismo para todos:

- **Owner:** abrir los pedidos de Casa Félix, aprobar o desaprobar un pedido, navegar a las entregas del rider y simular un fallo del servidor para comprobar los mensajes de error.
- **Rider:** abrir «My orders», abrir y cancelar el cuadro de entrega, confirmar con un código incorrecto (`0000`) y con el correcto (`1234`).

De cada paso se guardó una captura de pantalla y el registro de las llamadas a la API, disponibles en la revisión. Cuando la lista de pedidos no cargaba por un fallo en la URL, se repitió el recorrido corrigiendo solo esa URL. Lo que seguía sin poder usarse se valoró sobre el código, como dice la regla común 3.

## Tu comentario en Enseñanza Virtual y la revisión

El comentario de tu calificación empieza por tu nota y recorre los seis ejercicios en orden. Para cada uno indica los puntos obtenidos sobre el máximo, en qué te has equivocado y, entre paréntesis, cuánto resta cada error. Por ejemplo:

```
Ejercicio 2 (1,75 / 2). Las rutas y los middlewares están bien, salvo checkDeliveryCode: lee el código de req.body en lugar del parámetro de la URL, así que rechaza también el código correcto (−0,25).
```

Para entender una resta, busca ese error en la sección de su ejercicio.

Si tras leer el comentario y esta rúbrica crees que hay un error, solicítalo en la revisión. El profesor anunciará en Enseñanza Virtual la fecha y el lugar. Indica el ejercicio y la resta que quieres revisar. En la revisión podrás ver las capturas de pantalla y los resultados de los tests de tu entrega.
