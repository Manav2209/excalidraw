/*
  Warnings:

  - You are about to drop the column `adminId` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `photo` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Chat` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `roomName` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_userId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_adminId_fkey";

-- DropIndex
DROP INDEX "Room_slug_key";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "adminId",
DROP COLUMN "createdAt",
DROP COLUMN "slug",
ADD COLUMN     "roomName" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
DROP COLUMN "photo",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "username" TEXT NOT NULL;

-- DropTable
DROP TABLE "Chat";

-- CreateTable
CREATE TABLE "Shape" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Shape_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shape" ADD CONSTRAINT "Shape_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shape" ADD CONSTRAINT "Shape_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
