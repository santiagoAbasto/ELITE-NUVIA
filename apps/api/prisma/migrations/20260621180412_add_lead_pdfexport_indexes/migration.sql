/*
  Warnings:

  - You are about to drop the `Agente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Foto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Propiedad` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Testimonio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LeadEstado" AS ENUM ('NUEVO', 'EN_CONTACTO', 'INTERESADO', 'NEGOCIACION', 'CERRADO', 'PERDIDO');

-- DropForeignKey
ALTER TABLE "Foto" DROP CONSTRAINT "Foto_propiedadId_fkey";

-- DropForeignKey
ALTER TABLE "Propiedad" DROP CONSTRAINT "Propiedad_agenteId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_agenteId_fkey";

-- DropTable
DROP TABLE "Agente";

-- DropTable
DROP TABLE "Foto";

-- DropTable
DROP TABLE "Propiedad";

-- DropTable
DROP TABLE "Testimonio";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "agenteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agentes" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "foto" TEXT,
    "bio" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propiedades" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" "TipoOperacion" NOT NULL,
    "tipoInmueble" "TipoInmueble" NOT NULL,
    "precio" DECIMAL(12,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'BOB',
    "ciudad" TEXT NOT NULL,
    "zona" TEXT,
    "direccion" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "dormitorios" INTEGER,
    "banos" INTEGER,
    "superficieM2" DECIMAL(10,2),
    "garage" BOOLEAN NOT NULL DEFAULT false,
    "amueblado" BOOLEAN NOT NULL DEFAULT false,
    "piscina" BOOLEAN NOT NULL DEFAULT false,
    "destacada" BOOLEAN NOT NULL DEFAULT false,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "agenteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "propiedades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "urlThumb" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "propiedadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fotos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "tipo" "TipoOperacion" NOT NULL,
    "foto" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testimonios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT NOT NULL,
    "mensaje" TEXT,
    "estado" "LeadEstado" NOT NULL DEFAULT 'NUEVO',
    "propiedadId" TEXT,
    "agenteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdf_exports" (
    "id" TEXT NOT NULL,
    "propiedadId" TEXT NOT NULL,
    "agenteId" TEXT NOT NULL,
    "generadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pdf_exports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_agenteId_key" ON "users"("agenteId");

-- CreateIndex
CREATE UNIQUE INDEX "agentes_slug_key" ON "agentes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "agentes_email_key" ON "agentes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "propiedades_slug_key" ON "propiedades"("slug");

-- CreateIndex
CREATE INDEX "propiedades_tipo_activa_idx" ON "propiedades"("tipo", "activa");

-- CreateIndex
CREATE INDEX "propiedades_ciudad_activa_idx" ON "propiedades"("ciudad", "activa");

-- CreateIndex
CREATE INDEX "propiedades_destacada_activa_idx" ON "propiedades"("destacada", "activa");

-- CreateIndex
CREATE INDEX "fotos_propiedadId_orden_idx" ON "fotos"("propiedadId", "orden");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "agentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propiedades" ADD CONSTRAINT "propiedades_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "agentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "propiedades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "propiedades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "agentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdf_exports" ADD CONSTRAINT "pdf_exports_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "propiedades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdf_exports" ADD CONSTRAINT "pdf_exports_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "agentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
