import Image from "next/image"
import { MapPin, Building } from "lucide-react"

import type { Doctor } from "@/types/doctor"

interface DoctorCardProps {
  doctor: Doctor
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  // Extract years of experience as a number
  const experienceYears = Number.parseInt(doctor.experience.match(/\d+/)?.[0] || "0")

  // Extract fee amount
  const fee = doctor.fees

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden" data-testid="doctor-card">
      <div className="p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-shrink-0">
          <div className="relative h-24 w-24 rounded-full overflow-hidden">
            <Image
              src={doctor.photo || "/placeholder.svg?height=96&width=96"}
              alt={doctor.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex-grow">
          <h2 className="text-xl font-semibold text-blue-800" data-testid="doctor-name">
            {doctor.name}
          </h2>

          <div className="mt-1" data-testid="doctor-specialty">
            {doctor.specialities.map((specialty, index) => (
              <span key={index} className="text-gray-600">
                {specialty.name}
                {index < doctor.specialities.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>

          <div className="mt-1 text-gray-600" data-testid="doctor-experience">
            {doctor.experience}
          </div>

          <div className="mt-2 flex items-center text-gray-600">
            <Building className="h-4 w-4 mr-1" />
            <span>{doctor.clinic.name}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {doctor.clinic.address.locality}, {doctor.clinic.address.city}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {doctor.languages.map((language, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                {language}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end justify-between">
          <div className="text-xl font-bold text-blue-800" data-testid="doctor-fee">
            {fee}
          </div>

          <button className="mt-2 px-10 py-2 border border-blue-600 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
  Book Appointment
</button>



        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-2">
          {doctor.video_consult && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Video Consult</span>
          )}
          {doctor.in_clinic && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">In Clinic</span>
          )}
        </div>
      </div>
    </div>
  )
}
