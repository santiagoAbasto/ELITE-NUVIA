-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('VISITA', 'LLAMADA', 'CIERRE', 'REUNION');

-- CreateEnum
CREATE TYPE "EstadoCaptacion" AS ENUM ('EN_NEGOCIACION', 'CAPTADA', 'PUBLICADA', 'EN_CIERRE', 'CERRADA', 'EXPIRADA');

-- AlterTable
ALTER TABLE "agentes" ADD COLUMN     "contratoFin" TIMESTAMP(3),
ADD COLUMN     "contratoInicio" TIMESTAMP(3),
ADD COLUMN     "contratoUrl" TEXT,
ADD COLUMN     "fechaNacimiento" TIMESTAMP(3),
ADD COLUMN     "primerApellido" TEXT,
ADD COLUMN     "segundoApellido" TEXT;

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "comision" DECIMAL(12,2),
ADD COLUMN     "preferencias" JSONB,
ADD COLUMN     "presupuesto" DECIMAL(12,2),
ADD COLUMN     "temperatura" TEXT NOT NULL DEFAULT 'FRIO',
ADD COLUMN     "valorCierre" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "propiedades" ADD COLUMN     "agenteAsignadoId" TEXT;

-- CreateTable
CREATE TABLE "site_content" (
    "id" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    "datos" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "site_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "captaciones" (
    "id" TEXT NOT NULL,
    "propietarioNombre" TEXT NOT NULL,
    "propietarioTelefono" TEXT NOT NULL,
    "propietarioEmail" TEXT,
    "propietarioDoc" TEXT,
    "tipoInmueble" "TipoInmueble" NOT NULL,
    "tipo" "TipoOperacion" NOT NULL,
    "ciudad" TEXT NOT NULL,
    "zona" TEXT,
    "direccion" TEXT,
    "descripcion" TEXT,
    "dormitorios" INTEGER,
    "banos" INTEGER,
    "superficieM2" DECIMAL(10,2),
    "garage" BOOLEAN NOT NULL DEFAULT false,
    "amueblado" BOOLEAN NOT NULL DEFAULT false,
    "piscina" BOOLEAN NOT NULL DEFAULT false,
    "fotos" JSONB NOT NULL DEFAULT '[]',
    "precioSolicitado" DECIMAL(12,2) NOT NULL,
    "precioSugerido" DECIMAL(12,2),
    "moneda" TEXT NOT NULL DEFAULT 'BOB',
    "comisionPct" DECIMAL(5,2),
    "fechaCaptacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contratoUrl" TEXT,
    "exclusividadInicio" TIMESTAMP(3),
    "exclusividadFin" TIMESTAMP(3),
    "estado" "EstadoCaptacion" NOT NULL DEFAULT 'EN_NEGOCIACION',
    "agenteId" TEXT NOT NULL,
    "propiedadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "captaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividades_captacion" (
    "id" TEXT NOT NULL,
    "captacionId" TEXT NOT NULL,
    "agenteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actividades_captacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" "TipoEvento" NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "agenteId" TEXT NOT NULL,
    "leadId" TEXT,
    "propiedadId" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interacciones" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "agenteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "eventoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interacciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "tipo" TEXT NOT NULL,
    "referenciaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_content_seccion_key" ON "site_content"("seccion");

-- CreateIndex
CREATE UNIQUE INDEX "captaciones_propiedadId_key" ON "captaciones"("propiedadId");

-- AddForeignKey
ALTER TABLE "captaciones" ADD CONSTRAINT "captaciones_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "agentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "captaciones" ADD CONSTRAINT "captaciones_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "propiedades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades_captacion" ADD CONSTRAINT "actividades_captacion_captacionId_fkey" FOREIGN KEY ("captacionId") REFERENCES "captaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades_captacion" ADD CONSTRAINT "actividades_captacion_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "agentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "agentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "propiedades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacciones" ADD CONSTRAINT "interacciones_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacciones" ADD CONSTRAINT "interacciones_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "agentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
