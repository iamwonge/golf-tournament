/*
  Warnings:

  - You are about to drop the column `userId` on the `longest_records` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `nearest_records` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `putting_records` table. All the data in the column will be lost.
  - Added the required column `department` to the `longest_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playerName` to the `longest_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department` to the `nearest_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playerName` to the `nearest_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department` to the `putting_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playerName` to the `putting_records` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_longest_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "distance" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_longest_records" ("createdAt", "distance", "id", "updatedAt") SELECT "createdAt", "distance", "id", "updatedAt" FROM "longest_records";
DROP TABLE "longest_records";
ALTER TABLE "new_longest_records" RENAME TO "longest_records";
CREATE TABLE "new_nearest_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "distance" REAL NOT NULL,
    "accuracy" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_nearest_records" ("accuracy", "createdAt", "distance", "id", "updatedAt") SELECT "accuracy", "createdAt", "distance", "id", "updatedAt" FROM "nearest_records";
DROP TABLE "nearest_records";
ALTER TABLE "new_nearest_records" RENAME TO "nearest_records";
CREATE TABLE "new_putting_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "distance" REAL NOT NULL,
    "accuracy" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_putting_records" ("accuracy", "createdAt", "distance", "id", "updatedAt") SELECT "accuracy", "createdAt", "distance", "id", "updatedAt" FROM "putting_records";
DROP TABLE "putting_records";
ALTER TABLE "new_putting_records" RENAME TO "putting_records";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
