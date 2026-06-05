-- AlterTable
ALTER TABLE "FlightBooking" ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED';

-- AlterTable
ALTER TABLE "HotelBooking" ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED';
