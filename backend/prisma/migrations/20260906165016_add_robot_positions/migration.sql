-- CreateTable
CREATE TABLE "robot_positions" (
    "id" UUID NOT NULL,
    "robot_id" UUID NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "robot_positions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "robot_positions_robot_id_created_at_idx" ON "robot_positions"("robot_id", "created_at");

-- AddForeignKey
ALTER TABLE "robot_positions" ADD CONSTRAINT "robot_positions_robot_id_fkey" FOREIGN KEY ("robot_id") REFERENCES "robots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
