import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Photo credits",
  description: "Attribution for photography used on MtaaHub.",
};

const CREDITS = [
  {
    file: "houses.jpg",
    used: "Houses for Rent",
    title: "House in Poland",
    author: "NeonFor",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    page: "https://commons.wikimedia.org/wiki/File:House_in_Poland.png",
  },
  {
    file: "plumbing.jpg",
    used: "Plumbing Services",
    title: "Hull Maintenance Technician 3rd Class Billy Hamilton repairs a shipboard sink",
    author: "U.S. Navy photo by Photographer's Mate Airman Kamille Ellis",
    license: "Public domain",
    licenseUrl: "",
    page: "https://commons.wikimedia.org/wiki/File:US_Navy_031208-N-9392E-010_Hull_Maintenance_Technician_3rd_Class_Billy_Hamilton_cuts_some_pipe_that_he%27s_using_to_repair_a_shipboard_sink_on_the_Seventh_Fleet_Command_Ship,_USS_Blue_Ridge_(LCC_19).jpg",
  },
  {
    file: "repair.jpg",
    used: "Phone & Laptop Repair",
    title: "A Ghanaian Computer Hardware Technician",
    author: "Amuzujoe",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    page: "https://commons.wikimedia.org/wiki/File:A_Ghanaian_Computer_Hardware_Technician.jpg",
  },
  {
    file: "cleaning.jpg",
    used: "Cleaning Services",
    title: "Housekeeping service staff mopping a floor",
    author: "Arayabee",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    page: "https://commons.wikimedia.org/wiki/File:%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%81%E0%B8%A1%E0%B9%88%E0%B8%9A%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%97%E0%B8%B3%E0%B8%84%E0%B8%A7%E0%B8%B2%E0%B8%A1%E0%B8%AA%E0%B8%B0%E0%B8%AD%E0%B8%B2%E0%B8%94_%E0%B9%81%E0%B8%9A%E0%B8%9A%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%88%E0%B8%B3.jpg",
  },
  {
    file: "tailoring.jpg",
    used: "Tailoring Services",
    title: "A Tailor Sewing Clothes in Her Shop",
    author: "Meritkosy",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    page: "https://commons.wikimedia.org/wiki/File:A_Tailor_Sewing_Clothes_in_Her_Shop.jpg",
  },
  {
    file: "../hero-nairobi.jpg",
    used: "Homepage hero",
    title: "Nairobi city skyline at dawn",
    author: "Clinton Nyabuto",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    page: "https://commons.wikimedia.org/wiki/File:Nairobi_city_skyline_at_dawn_2025.jpg",
  },
];

export default function CreditsPage() {
  return (
    <div className="bg-ink-50/50 pb-16">
      <div className="container-main max-w-3xl pt-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-3.5 w-3.5" /> Back home
        </Link>

        <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink-900">Photo credits</h1>
        <p className="mt-2 text-[13.5px] text-ink-600">
          Photography on MtaaHub comes from Wikimedia Commons contributors. Images have been cropped and resized for
          display; the underlying works remain under their original licences.
        </p>

        <ul className="mt-8 space-y-3">
          {CREDITS.map((credit) => (
            <li key={credit.file} className="rounded-2xl border border-ink-100 bg-white p-4">
              <p className="text-[13px] font-semibold text-ink-900">{credit.title}</p>
              <p className="mt-1 text-[12px] text-ink-600">
                {credit.author} ·{" "}
                {credit.licenseUrl ? (
                  <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-700 hover:underline">
                    {credit.license}
                  </a>
                ) : (
                  <span className="font-medium">{credit.license}</span>
                )}{" "}
                · used for {credit.used}
              </p>
              <a
                href={credit.page}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-[11.5px] text-ink-400 hover:text-primary-700 hover:underline"
              >
                Source on Wikimedia Commons
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
