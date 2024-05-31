-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "member_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "mfa_enrolled" BOOLEAN NOT NULL,
    "step_up_auth_enabled" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "User_member_id_key" ON "User"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_address_key" ON "User"("email_address");
