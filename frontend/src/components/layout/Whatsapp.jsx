
 import { MessageCircle } from "lucide-react";

 
export default function WhatsAppButton() {
  // 1. Format: Country Code + Number (No +, no spaces, no dashes)
  // Example: 254712345678
  const phoneNumber = "254792514301"; 
  const defaultMessage = "Hi there! I'm interested in your services.";
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#20ba5a] hover:scale-110 transition-all duration-300 z-[999] group flex items-center gap-2"
      aria-label="Chat on WhatsApp"
    >
      {/* Tooltip that appears on hover */}
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-medium">
        Chat with me
      </span>
      
      <MessageCircle size={28} fill="currentColor" className="text-white" />

      {/* Pulsing notification dot */}
      <span className="absolute top-0 right-0 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-100 border-2 border-[#25D366]"></span>
      </span>
    </a>
  );
}



