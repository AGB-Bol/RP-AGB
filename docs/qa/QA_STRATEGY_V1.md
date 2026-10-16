# ESTRATEGIA DE ASEGURAMIENTO DE CALIDAD (QA)

**Proyecto:** RP-AGB  
**Código de tarea:** SP0-12  
**Versión:** 1.0  
**Estado:** Pendiente de validación  
**Responsable:** QA  
**Caso de estudio:** Air Giants Bolivia S.R.L. (AGB)  
**Fecha:** 15 de octubre de 2026

---

## 1. OBJETIVO

Establecer la estrategia de aseguramiento de calidad del proyecto RP-AGB, definiendo los niveles de prueba, las herramientas, los criterios de aceptación y el procedimiento para gestionar defectos, con el propósito de verificar que el sistema cumpla los requisitos funcionales y técnicos establecidos.

## 2. ALCANCE

La estrategia comprende las pruebas del frontend desarrollado con Next.js 15, React 19 y TypeScript 5, así como las API de los microservicios de Reservas, Clientes, Proveedores y Reportes, desarrollados con .NET.

Se consideran las pruebas unitarias, de integración de API y de extremo a extremo (E2E). También se incluye el registro, seguimiento, corrección y verificación de defectos mediante Jira.

Las pruebas se incorporarán progresivamente conforme los componentes y endpoints estén disponibles. No se considerará aprobada una prueba hasta que exista evidencia de su ejecución y se hayan verificado sus resultados.

## 3. NIVELES DE PRUEBA

### 3.1. Pruebas unitarias

Verifican el funcionamiento individual de funciones, métodos y componentes sin depender de todo el sistema.

- **Backend:** xUnit para las clases y servicios desarrollados en .NET.
- **Frontend:** Jest para las funciones y componentes que correspondan.
- **Responsables:** Backend y Frontend, con seguimiento de QA.
- **Criterio de aceptación:** las pruebas implementadas deben ejecutarse correctamente y cubrir los comportamientos definidos para el componente.

### 3.2. Pruebas de integración de API

Verifican la comunicación entre componentes y el comportamiento de las API mediante solicitudes HTTP.

Se comprobarán los códigos de respuesta, la estructura de los datos, las validaciones, el manejo de errores y la autorización cuando corresponda.

- **Herramienta:** Postman.
- **Responsable de ejecución:** QA, con apoyo de Backend.
- **Criterio de aceptación:** las respuestas deben cumplir el contrato documentado de cada endpoint y los requisitos de seguridad aplicables.

### 3.3. Pruebas de extremo a extremo (E2E)

Verifican los flujos completos desde la interfaz del usuario hasta el resultado esperado del sistema.

Se evaluarán la carga de páginas, la navegación, los formularios y las operaciones funcionales disponibles en el entorno de prueba.

- **Herramienta:** Playwright.
- **Responsables:** QA y Frontend.
- **Criterio de aceptación:** los flujos probados deben cumplir los resultados esperados y no presentar errores que impidan su funcionamiento.

## 4. HERRAMIENTAS DE QA

| Herramienta | Uso previsto |
|---|---|
| xUnit | Pruebas unitarias del backend .NET. |
| Jest | Pruebas unitarias del frontend. |
| Postman | Pruebas de integración de API. |
| Playwright | Automatización de pruebas E2E. |
| Jira | Registro y seguimiento de defectos. |
| Docker Compose | Preparación y ejecución del entorno de prueba. |
| Git y GitHub | Control de versiones, revisión y entrega de cambios. |
| Swagger/OpenAPI | Consulta y verificación de los contratos de API. |

Las herramientas se configurarán de acuerdo con la estructura del repositorio y las decisiones técnicas del equipo. La incorporación de cada herramienta deberá validarse antes de considerarla operativa.

## 5. MATRIZ INICIAL DE PRUEBAS

Los siguientes casos constituyen la planificación inicial de QA. Su estado inicial es **Pendiente**, hasta que puedan ejecutarse en un entorno disponible.

| ID | Módulo | Tipo de prueba | Caso de prueba | Resultado esperado | Prioridad | Estado inicial |
|---|---|---|---|---|---|---|
| TC-01 | Frontend | E2E | Acceder a la página principal. | La página carga correctamente y muestra la interfaz esperada. | Alta | Pendiente |
| TC-02 | Frontend | E2E | Navegar entre las páginas disponibles. | La navegación funciona y las rutas responden correctamente. | Media | Pendiente |
| TC-03 | Clientes | Integración API | Consultar clientes mediante un endpoint documentado. | La API devuelve los datos y el código HTTP esperado. | Alta | Pendiente |
| TC-04 | Clientes | Integración API | Enviar datos inválidos al endpoint de clientes. | La API rechaza los datos inválidos conforme al contrato establecido. | Alta | Pendiente |
| TC-05 | Reservas | Integración API | Registrar una reserva con datos válidos. | La reserva se registra correctamente según las reglas de negocio. | Alta | Pendiente |
| TC-06 | Proveedores | Integración API | Consultar proveedores mediante un endpoint documentado. | La API devuelve la respuesta definida en su contrato. | Media | Pendiente |
| TC-07 | Reportes | Integración API | Solicitar un reporte disponible. | La API devuelve la estructura y los datos esperados. | Media | Pendiente |
| TC-08 | Sistema | E2E | Completar un flujo funcional disponible desde el frontend. | El flujo termina correctamente y presenta el resultado esperado. | Alta | Pendiente |

**Nota:** los casos de integración de API se ejecutarán cuando existan endpoints implementados y documentados. Los casos E2E se ajustarán a las pantallas y funcionalidades realmente disponibles. Las rutas, datos de prueba y precondiciones específicas se documentarán antes de ejecutar cada caso.

### 5.1. Registro de resultados

Cada ejecución deberá registrar:

- Identificador del caso de prueba.
- Fecha de ejecución.
- Ambiente y versión evaluados.
- Datos utilizados.
- Resultado esperado y resultado obtenido.
- Estado: Pendiente, Aprobado, Fallido o Bloqueado.
- Evidencia de ejecución y, cuando corresponda, identificador del bug en Jira.

Una prueba fallida deberá generar un defecto cuando se confirme que el comportamiento observado incumple un requisito o resultado esperado.

## 6. CICLO DE VIDA DE LOS DEFECTOS

El ciclo de vida de un defecto comprende las siguientes etapas:

1. **Detección:** QA identifica un comportamiento incorrecto durante una prueba.
2. **Registro:** se crea una incidencia en Jira con los datos necesarios para reproducir el problema.
3. **Revisión:** el equipo verifica que el defecto sea comprensible, reproducible y no esté duplicado.
4. **Asignación:** se asigna al responsable técnico correspondiente.
5. **Corrección:** desarrollo analiza y corrige la causa del defecto.
6. **Verificación:** el responsable indica que la corrección está disponible y QA ejecuta nuevamente el caso.
7. **Cierre o reapertura:** si la prueba pasa, el defecto se cierra; si el problema persiste, se reabre y vuelve a desarrollo.
8. **Seguimiento:** QA actualiza el registro y conserva la evidencia de la resolución.

### 6.1. Estados propuestos en Jira

| Estado | Descripción |
|---|---|
| Abierto | Defecto registrado y pendiente de revisión. |
| En progreso | El equipo está trabajando en la corrección. |
| Listo para QA | La corrección está disponible para verificación. |
| En pruebas | QA está verificando el defecto corregido. |
| Cerrado | La corrección fue verificada satisfactoriamente. |
| Reabierto | El defecto persiste o vuelve a presentarse. |

Los estados y las transiciones definitivas se configurarán de acuerdo con las capacidades de Jira y los acuerdos del equipo.

## 7. PLANTILLA ESTÁNDAR PARA REPORTAR BUGS

Cada defecto deberá registrarse en Jira con la siguiente información:

| Campo | Descripción |
|---|---|
| Título | Resumen claro y específico del problema. |
| ID | Identificador generado por Jira. |
| Historia de usuario | Historia o requisito relacionado, si corresponde. |
| Módulo | Componente afectado: Reservas, Clientes, Proveedores, Reportes o Frontend. |
| Ambiente | Entorno en el que se detectó el defecto. |
| Versión o commit | Versión del sistema evaluada, cuando esté disponible. |
| Precondiciones | Condiciones necesarias para reproducir el problema. |
| Pasos para reproducir | Secuencia numerada de acciones. |
| Resultado esperado | Comportamiento definido por el requisito. |
| Resultado obtenido | Comportamiento observado durante la prueba. |
| Severidad | Impacto técnico o funcional del defecto. |
| Prioridad | Urgencia con la que debe atenderse. |
| Evidencia | Capturas, registros, respuestas HTTP o trazas relevantes. |
| Responsable | Persona encargada de analizar o corregir el defecto. |
| Estado | Situación actual de la incidencia. |
| Retest | Resultado de la verificación posterior a la corrección. |

### 7.1. Clasificación de severidad

- **Crítica:** provoca una interrupción general, pérdida importante de información o un riesgo grave de seguridad.
- **Alta:** impide una funcionalidad principal sin una alternativa aceptable.
- **Media:** afecta una funcionalidad, pero existe una alternativa temporal.
- **Baja:** afecta detalles menores de presentación o usabilidad.

La severidad describe el impacto del defecto. La prioridad indica la urgencia de su resolución; ambas deberán evaluarse por separado.

## 8. CRITERIOS DE ACEPTACIÓN DE LA ESTRATEGIA QA

La tarea SP0-12 se considerará completada cuando se cumplan los siguientes criterios:

1. El archivo `docs/qa/QA_STRATEGY_V1.md` esté versionado en el repositorio.
2. El documento defina los niveles de prueba, las herramientas y sus responsabilidades.
3. Exista una matriz inicial con casos identificados, resultados esperados y prioridades.
4. Se encuentre documentado el ciclo de vida de los defectos y la plantilla de Jira.
5. Los casos de prueba y sus estados permitan distinguir claramente entre pruebas planificadas y ejecutadas.
6. El Tech Lead y el Scrum Master revisen y aprueben la estrategia.
7. Los cambios se entreguen mediante un Pull Request siguiendo el proceso de revisión del equipo.

La aprobación de la estrategia no implica que todas las pruebas del sistema estén ejecutadas. La ejecución se realizará progresivamente durante el desarrollo.

## 9. ROLES Y RESPONSABILIDADES

| Rol | Responsabilidades relacionadas con QA |
|---|---|
| QA | Definir la estrategia, preparar casos de prueba, ejecutar pruebas, documentar evidencias y gestionar defectos. |
| Backend | Implementar y probar los microservicios, corregir defectos y mantener documentados los contratos de API. |
| Frontend | Implementar la interfaz, corregir defectos visuales y funcionales y apoyar las pruebas E2E. |
| DevOps | Mantener disponible el entorno de prueba y apoyar la ejecución mediante Docker Compose. |
| Tech Lead | Revisar la viabilidad técnica, validar la estrategia y verificar su alineación con la arquitectura. |
| Scrum Master | Facilitar la coordinación, el seguimiento de la tarea y el proceso de aprobación. |
| Product Owner | Aclarar requisitos, reglas de negocio y criterios de aceptación funcionales. |

QA es responsable de verificar la calidad, pero la calidad del producto es responsabilidad compartida de todo el equipo.

## 10. APROBACIONES

La estrategia deberá ser revisada y aprobada por el Tech Lead y el Scrum Master antes de considerarse formalmente validada.

| Responsable | Resultado | Fecha |
|---|---|---|
| QA | Elaboración del documento | 15/10/2026 |
| Tech Lead | Pendiente de revisión | Por definir |
| Scrum Master | Pendiente de revisión | Por definir |

La aprobación se registrará mediante el mecanismo acordado por el equipo, como la revisión del Pull Request o la confirmación documentada correspondiente.

---

**Fin del documento.**