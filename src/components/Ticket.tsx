// import React from "react";
// type TicketType = "workshop" | "conference" | "webinar";
// interface TicketProps {
//   type: TicketType;
//   title: string;
//   date: string;
//   time: string;
//   location: string;
//   code: string;
// }
// const typeColors = {
//   workshop: "bg-blue-500",
//   conference: "bg-amber-400",
//   webinar: "bg-emerald-500",
// };
// export const Ticket: React.FC<TicketProps> = ({
//   type,
//   title,
//   date,
//   time,
//   location,
//   code,
// }) => {
//   return (
//     <div className="max-w-4xl h-full mx-auto p-4">
//       <div
//         className={`flex flex-col md:flex-row rounded-lg overflow-hidden shadow-lg ${typeColors[type]}`}
//       >
//         <div className="p-6 md:w-1/3">
//           <div className="text-white">
//             <h2 className="text-2xl font-bold mb-1">FCA</h2>
//             <h3 className="text-xl mb-4">{title}</h3>
//             <div className="space-y-2">
//               <p className="text-lg">{time}</p>
//               <p>{date}</p>
//               <p className="text-sm">{location}</p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white md:w-2/3 p-6 flex flex-col md:flex-row items-center justify-between">
//           <div className="w-32 h-32 bg-gray-200 mb-4 md:mb-0 flex items-center justify-center">
//             <div className="text-gray-500 text-center">QR Code</div>
//           </div>
//           <div className="text-center md:text-right">
//             <p className="text-lg">{time}</p>
//             <p className="text-xl font-bold">{date}</p>
//             <p className="text-gray-600">{location}</p>
//             <p className="mt-2 text-sm font-mono">{code}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

import React from 'react'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
type TicketType = 'program' | 'event'
interface TicketProps {
  type: TicketType
  title: string
  date: string
  time: string
  location: string
  code: string
  slug: string
  heroImage: string
}
const typeColors = {
  program: 'bg-blue-500',
  event: 'bg-amber-400',
}
export const Ticket: React.FC<TicketProps> = ({
  type,
  title,
  date,
  time,
  location,
  code,
  slug,
  heroImage,
}) => {
  return (
    <div className="max-w-4xl w-full mx-auto">
      {/* Mobile version */}
      <div className="md:hidden space-y-1">
        <div
          className={`rounded-lg overflow-hidden shadow-lg ${typeColors[type]} p-8`}
        >
          <div className="text-center text-white">
            <p className="text-4xl font-bold mb-2">FCA</p>
            <p className="text-xs uppercase tracking-wide mb-6">
              FUNDACIÓN CÓDIGO ABIERTO
            </p>
            <h2 className="text-2xl font-bold mb-6">{title}</h2>
            <p className="text-xl mb-1">{time}</p>
            <p className="text-xl mb-1">{date}</p>
            <p className="text-base">{location}</p>
          </div>
        </div>
        <div className="relative rounded-lg overflow-hidden shadow-lg">
          {/* Background Image with Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
            style={{
              backgroundImage: `url(${heroImage})`,
              filter: 'brightness(0.5) blur(1px)',
            }}
          />
          <div className="relative z-10 p-8">
            <div className="flex flex-col items-center text-white">
              <div className="bg-white/90 backdrop-blur-sm p-3 mb-6 rounded-lg">
                <QRCodeSVG
                  value={`https://www.codigoabierto.tech/eventos/${slug}`}
                  size={200}
                />
              </div>
              <p className="text-xl mb-1">{time}</p>
              <p className="text-xl mb-1">{date}</p>
              <p className="text-base mb-4">{location}</p>
              <p className="text-sm font-mono">#{code}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop version */}
      <div className="hidden md:block">
        <div
          className={`flex flex-row rounded-lg overflow-hidden shadow-lg ${typeColors[type]}`}
        >
          <div className="p-6 w-1/3 text-white flex flex-col">
            <div className="flex-1">
              <p className="text-4xl font-bold mb-1">FCA</p>
              <p className="text-xs uppercase tracking-wide mb-4">
                FUNDACIÓN CÓDIGO ABIERTO
              </p>
              <p className="text-lg font-medium">{title}</p>
            </div>
            <div className="mt-auto space-y-1 text-right">
              <p className="text-lg font-medium">{time}</p>
              <p className="text-lg font-medium">{date}</p>
              <p className="text-sm">{location}</p>
            </div>
          </div>
          <div className="relative w-2/3">
            {/* Background Image with Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${heroImage})`,
                filter: 'brightness(0.5) blur(1px)',
              }}
            />
            <div className="relative z-10 p-6 flex flex-row">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-6 text-white">{title}</h2>
                <div className="bg-white/90 backdrop-blur-sm p-2 inline-block rounded-lg">
                  <QRCodeSVG
                    value={`https://www.codigoabierto.tech/eventos/${slug}`}
                    size={120}
                  />
                </div>
              </div>
              <div className="text-right text-white">
                <p className="text-lg font-medium">{time}</p>
                <p className="text-lg font-medium">{date}</p>
                <p className="text-sm mb-6">{location}</p>
                <p className="text-sm font-mono">#{code}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
