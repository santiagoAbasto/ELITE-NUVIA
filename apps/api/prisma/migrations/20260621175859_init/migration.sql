-- CreateEnum
CREATE TYPE "TipoOperacion" AS ENUM ('VENTA', 'ALQUILER', 'ANTICRETICO');

-- CreateEnum
CREATE TYPE "TipoInmueble" AS ENUM ('CASA', 'DEPARTAMENTO', 'GARZONIER', 'TERRENO', 'LOCAL', 'OTRO');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('SUPER_ADMIN', 'AGENTE', 'COORDINADOR');

-- CreateTable
CREATE TABLE "Propiedad" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" "TipoOperacion" NOT NULL,
    "tipoInmueble" "TipoInmueble" NOT NULL,
    "precio" DECIMAL(65,30) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'BOB',
    "ciudad" TEXT NOT NULL,
    "zona" TEXT,
    "direccion" TEXT,
    "dormitorios" INTEGER,
    "banos" INTEGER,
    "superficieM2" DECIMAL(65,30),
    "garage" BOOLEAN NOT NULL DEFAULT false,
    "amueblado" BOOLEAN NOT NULL DEFAULT false,
    "piscina" BOOLEAN NOT NULL DEFAULT false,
    "agenteId" TEXT NOT NULL,
    "destacada" BOOLEAN NOT NULL DEFAULT false,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Propiedad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agente" (
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

    CONSTRAINT "Agente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "urlThumb" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "propiedadId" TEXT NOT NULL,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "agenteId" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "tipo" "TipoOperacion" NOT NULL,
    "foto" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Testimonio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Propiedad_slug_key" ON "Propiedad"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Agente_slug_key" ON "Agente"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Agente_email_key" ON "Agente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_agenteId_key" ON "User"("agenteId");

-- AddForeignKey
ALTER TABLE "Propiedad" ADD CONSTRAINT "Propiedad_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "Agente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "Agente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
