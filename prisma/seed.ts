import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita-Taveta", "Garissa", "Wajir",
  "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka-Nithi", "Embu", "Kitui", "Machakos",
  "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot",
  "Samburu", "Trans-Nzoia", "Uasin Gishu", "Elgeyo-Marakwet", "Nandi", "Baringo", "Laikipia",
  "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia",
  "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi",
];

const TOWNS: Record<string, { town: string; estates: string[] }[]> = {
  Nairobi: [
    { town: "Westlands", estates: ["Kilimani", "Kileleshwa", "Parklands", "Lavington"] },
    { town: "Kasarani", estates: ["Kahawa West", "Zimmerman", "Roysambu", "Mwiki"] },
    { town: "Embakasi", estates: ["Utawala", "Kayole", "Pipeline", "Fedha"] },
    { town: "Langata", estates: ["Karen", "South B", "South C", "Ngong Road"] },
    { town: "Makadara", estates: ["Buruburu", "Donholm", "Umoja", "Jericho"] },
  ],
  Kiambu: [
    { town: "Ruiru", estates: ["Kahawa Wendani", "Kamakis", "Mwihoko"] },
    { town: "Thika", estates: ["Makongeni", "Section 9", "Ngoingwa"] },
  ],
  Mombasa: [
    { town: "Nyali", estates: ["Mkomani", "Freretown", "Links Road"] },
    { town: "Likoni", estates: ["Shika Adabu", "Bofu"] },
  ],
  Nakuru: [{ town: "Nakuru", estates: ["Milimani", "Section 58", "Kiamunyi"] }],
  Kisumu: [{ town: "Kisumu", estates: ["Milimani", "Nyalenda", "Riat Hills"] }],
};

const SETTINGS = [
  { key: "platform_name", value: "MtaaHub", type: "string", public: true },
  { key: "platform_tagline", value: "Your Mtaa. Our Hub.", type: "string", public: true },
  { key: "support_email", value: "support@mtaahub.co.ke", type: "string", public: true },
  { key: "max_listing_images", value: "10", type: "number", public: false },
  { key: "listing_expiry_days", value: "60", type: "number", public: false },
  { key: "auto_approve_listings", value: "false", type: "boolean", public: false },
  { key: "enable_verification", value: "true", type: "boolean", public: false },
  { key: "enable_ai_assistant", value: "false", type: "boolean", public: false },
];

async function main() {
  console.log("🌱 Seeding MtaaHub…");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@mtaahub.co.ke" },
    update: { role: "SUPER_ADMIN", displayName: "Amani Otieno", passwordHash },
    create: {
      email: "admin@mtaahub.co.ke",
      name: "Amani Otieno",
      displayName: "Amani Otieno",
      role: "SUPER_ADMIN",
      passwordHash,
      county: "Nairobi",
      town: "Westlands",
      emailVerified: new Date(),
    },
  });

  const demoUsers = [
    { email: "brian@mtaahub.co.ke", name: "Brian Mwangi", county: "Nairobi", town: "Kasarani" },
    { email: "wanjiku@mtaahub.co.ke", name: "Wanjiku Kamau", county: "Nairobi", town: "Westlands" },
    { email: "ali@mtaahub.co.ke", name: "Ali Hassan", county: "Mombasa", town: "Nyali" },
    { email: "chebet@mtaahub.co.ke", name: "Faith Chebet", county: "Nakuru", town: "Nakuru" },
  ];

  const users: { id: string; email: string; name: string | null }[] = [];
  for (const u of demoUsers) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: { displayName: u.name, county: u.county, town: u.town },
      create: {
        email: u.email,
        name: u.name,
        displayName: u.name,
        passwordHash,
        county: u.county,
        town: u.town,
        emailVerified: new Date(),
        lastLoginAt: new Date(),
      },
    });
    users.push({ id: created.id, email: created.email, name: created.name });
  }

  let locationCount = 0;
  const locIds: Record<string, string> = {};

  for (const county of COUNTIES) {
    const loc = await prisma.location.upsert({
      where: { county_town_estate: { county, town: "", estate: "" } },
      update: {},
      create: { county, town: "", estate: "" },
    });
    locIds[`${county}|`] = loc.id;
    locationCount++;

    for (const t of TOWNS[county] ?? []) {
      const townLoc = await prisma.location.upsert({
        where: { county_town_estate: { county, town: t.town, estate: "" } },
        update: {},
        create: { county, town: t.town, estate: "" },
      });
      locIds[`${county}|${t.town}`] = townLoc.id;
      locationCount++;

      for (const estate of t.estates) {
        const estLoc = await prisma.location.upsert({
          where: { county_town_estate: { county, town: t.town, estate } },
          update: {},
          create: { county, town: t.town, estate },
        });
        locIds[`${county}|${t.town}|${estate}`] = estLoc.id;
        locationCount++;
      }
    }
  }
  console.log(`  ✓ ${locationCount} locations`);

  for (const s of SETTINGS) {
    await prisma.setting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
  }

  await prisma.listing.deleteMany({ where: { userId: { in: users.map((u) => u.id) } } });

  const listings = [
    {
      title: "Modern 2-bedroom in Kilimani",
      description:
        "Bright two-bedroom apartment with a spacious living room, fitted kitchen and secure parking. Walking distance to Yaya Centre, 24/7 security and borehole water.",
      propertyType: "2 Bedroom", bedrooms: 2, bathrooms: 2, rent: 55000, deposit: 110000,
      location: "Nairobi|Westlands|Kilimani",
      amenities: ["Parking", "Borehole", "Security", "Lift"], contactPhone: "+254712345001",
    },
    {
      title: "Cosy bedsitter in Kasarani",
      description:
        "Self-contained bedsitter in a quiet block off Mwiki Road. Tiled floors, hot shower, own meter and ample water. Matatu stage five minutes away.",
      propertyType: "Bedsitter", bedrooms: 1, bathrooms: 1, rent: 8500, deposit: 8500,
      location: "Nairobi|Kasarani|Mwiki",
      amenities: ["Own meter", "Water", "Tiled floors"], contactPhone: "+254712345002",
    },
    {
      title: "3-bedroom maisonette in Kahawa West",
      description:
        "Family maisonette with a private compound, three bedrooms upstairs, servant quarter and a mature garden. Gated community with a school nearby.",
      propertyType: "Maisonette", bedrooms: 3, bathrooms: 3, rent: 45000, deposit: 90000,
      location: "Nairobi|Kasarani|Kahawa West",
      amenities: ["Garden", "Parking", "Servant quarter", "Gated"], contactPhone: "+254712345003",
    },
    {
      title: "Studio apartment in Ruiru",
      description:
        "Newly built studio with a modern kitchenette, close to the Eastern Bypass and Kamakis trading centre. Ideal for young professionals.",
      propertyType: "Studio", bedrooms: 1, bathrooms: 1, rent: 14000, deposit: 14000,
      location: "Kiambu|Ruiru|Kamakis",
      amenities: ["Parking", "CCTV", "Water tank"], contactPhone: "+254712345004",
    },
    {
      title: "Spacious 2-bedroom in Nyali",
      description:
        "Beach-side apartment a short walk from Nyali beach. Two en-suite bedrooms, balcony, shared pool and standby generator.",
      propertyType: "2 Bedroom", bedrooms: 2, bathrooms: 2, rent: 38000, deposit: 76000,
      location: "Mombasa|Nyali|Mkomani",
      amenities: ["Pool", "Generator", "Balcony", "Security"], contactPhone: "+254712345005",
    },
    {
      title: "Single room in Utawala",
      description:
        "Affordable single room in a shared compound with communal water point and reliable matatu connection to town. Good for a single tenant.",
      propertyType: "Single Room", bedrooms: 1, bathrooms: 1, rent: 4500, deposit: 4500,
      location: "Nairobi|Embakasi|Utawala",
      amenities: ["Water", "Security"], contactPhone: "+254712345006",
    },
    {
      title: "Office space on Ngong Road",
      description:
        "Open-plan office of 60sqm on the second floor, fibre-ready, with parking for four cars and 24-hour access control.",
      propertyType: "Office", bedrooms: null, bathrooms: 2, rent: 65000, deposit: 130000,
      location: "Nairobi|Langata|Ngong Road",
      amenities: ["Fibre", "Parking", "24/7 access"], contactPhone: "+254712345007",
    },
    {
      title: "2-bedroom in Milimani, Nakuru",
      description:
        "Quiet neighbourhood close to Nakuru CBD, two bedrooms with wardrobes, a shared laundry area and a secure perimeter wall.",
      propertyType: "2 Bedroom", bedrooms: 2, bathrooms: 1, rent: 22000, deposit: 44000,
      location: "Nakuru|Nakuru|Milimani",
      amenities: ["Parking", "Water", "Perimeter wall"], contactPhone: "+254712345008",
    },
  ];

  const createdListings = [];
  for (let i = 0; i < listings.length; i++) {
    const l = listings[i];
    const owner = users[i % users.length];
    const created = await prisma.listing.create({
      data: {
        userId: owner.id,
        locationId: locIds[l.location] ?? null,
        title: l.title,
        description: l.description,
        propertyType: l.propertyType,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        rent: l.rent,
        deposit: l.deposit,
        amenities: JSON.stringify(l.amenities),
        images: "[]",
        status: "ACTIVE",
        contactPhone: l.contactPhone,
        viewCount: 40 + i * 17,
        favouriteCount: i % 3,
        createdAt: new Date(Date.now() - i * 36 * 3600 * 1000),
      },
    });
    createdListings.push(created);
  }
  console.log(`  ✓ ${listings.length} listings`);

  await prisma.serviceProvider.deleteMany({ where: { userId: { in: users.map((u) => u.id) } } });

  const services = [
    { name: "Josphat Electrical", category: "Electrician", subcategory: "Wiring", desc: "Certified electrician for wiring, sockets, security lights and appliance repair. 12 years experience.", phone: "+254722000101", rate: "From KSh 1,500 per visit", town: "Nairobi|Kasarani|Kahawa West", rating: 4.7, reviews: 38 },
    { name: "Mwangi Plumbing Works", category: "Plumber", subcategory: "Leaks", desc: "Emergency leak repairs, tank installation and bathroom fittings. Same-day service within Nairobi.", phone: "+254722000102", rate: "From KSh 2,000 per job", town: "Nairobi|Westlands|Kilimani", rating: 4.5, reviews: 24 },
    { name: "CleanPro Nairobi", category: "Cleaner", subcategory: "Deep Clean", desc: "Deep cleaning for homes and offices, including sofas, carpets and post-construction cleanup.", phone: "+254722000103", rate: "From KSh 3,500", town: "Nairobi|Langata|South B", rating: 4.8, reviews: 51 },
    { name: "Westlands Phone Doctors", category: "Repair Technician", subcategory: "Phone", desc: "Screen replacement, battery and charging port repair for all major phone brands.", phone: "+254722000104", rate: "From KSh 1,200", town: "Nairobi|Embakasi|Pipeline", rating: 4.4, reviews: 19 },
    { name: "Mama Njeri Tailoring", category: "Tailor", subcategory: "Custom", desc: "Custom dresses, school uniforms and alterations. Pick-up and delivery within Nakuru.", phone: "+254722000105", rate: "From KSh 800", town: "Nakuru|Nakuru|Milimani", rating: 4.9, reviews: 63 },
    { name: "Hassan Carpentry", category: "Carpenter", subcategory: "Furniture", desc: "Bespoke wardrobes, kitchen cabinets and door repairs in Mombasa and neighbouring towns.", phone: "+254722000106", rate: "Quote on request", town: "Mombasa|Nyali|Mkomani", rating: 4.6, reviews: 27 },
  ];

  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    await prisma.serviceProvider.create({
      data: {
        userId: users[i % users.length].id,
        locationId: locIds[s.town] ?? null,
        name: s.name,
        category: s.category,
        subcategory: s.subcategory,
        description: s.desc,
        phone: s.phone,
        whatsapp: true,
        areasServed: JSON.stringify(["Nairobi", "Kiambu"]),
        pricing: s.rate,
        images: "[]",
        verificationStatus: "VERIFIED",
        rating: s.rating,
        reviewCount: s.reviews,
        viewCount: 120 + i * 9,
      },
    });
  }
  console.log(`  ✓ ${services.length} service providers`);

  await prisma.jobPost.deleteMany({ where: { postedById: { in: users.map((u) => u.id) } } });

  const jobs = [
    { title: "Customer Service Agent", company: "Safaricom", type: "full_time", category: "Customer Service", county: "Nairobi", town: "Westlands", salaryMin: 45000, salaryMax: 60000, desc: "Handle inbound customer queries across voice and chat channels. Diploma required, one year experience preferred.", remote: false },
    { title: "Sales Executive", company: "KRA", type: "full_time", category: "Sales", county: "Nairobi", town: "Nairobi Central", salaryMin: 60000, salaryMax: 85000, desc: "Grow the tax base through field engagement with SMEs. Degree in business and a valid driving licence required.", remote: false },
    { title: "Driver – Boda Boda", company: "Bolt", type: "contract", category: "Driver", county: "Nairobi", town: "Kasarani", salaryMin: 25000, salaryMax: 35000, desc: "Own a motorcycle and ride with Bolt. Flexible hours, weekly payouts and rider insurance included.", remote: false },
    { title: "Junior Software Developer", company: "Andela", type: "full_time", category: "Technology", county: "Nairobi", town: "Kilimani", salaryMin: 90000, salaryMax: 130000, desc: "Build and maintain React and Node services. One to three years experience with TypeScript.", remote: true },
    { title: "Receptionist", company: "Sarova Hotels", type: "full_time", category: "Hospitality", county: "Mombasa", town: "Nyali", salaryMin: 30000, salaryMax: 40000, desc: "Front desk support for a beach hotel. Excellent spoken English and Kiswahili required.", remote: false },
    { title: "Attachment – Accounting", company: "Deloitte", type: "attachment", category: "Finance", county: "Nairobi", town: "Nairobi Central", salaryMin: 15000, salaryMax: 20000, desc: "Three-month industrial attachment for accounting students in their final year of study.", remote: false },
  ];

  for (let i = 0; i < jobs.length; i++) {
    const j = jobs[i];
    await prisma.jobPost.create({
      data: {
        postedById: users[i % users.length].id,
        locationId: locIds[`${j.county}|${j.town}`] ?? null,
        title: j.title,
        companyName: j.company,
        description: j.desc,
        jobType: j.type,
        category: j.category,
        county: j.county,
        town: j.town,
        isRemote: j.remote,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        salaryPeriod: "MONTHLY",
        requirements: JSON.stringify(["CV", "Cover letter"]),
        status: "ACTIVE",
        viewCount: 80 + i * 12,
        deadline: new Date(Date.now() + (14 + i) * 86400000),
        createdAt: new Date(Date.now() - i * 7 * 3600 * 1000),
      },
    });
  }
  console.log(`  ✓ ${jobs.length} job posts`);

  await prisma.priceSubmission.deleteMany({ where: { submittedById: { in: users.map((u) => u.id) } } });

  const prices = [
    { item: "Unga (2kg)", cat: "Food", unit: "2kg packet", price: 190, county: "Nairobi", town: "Kasarani", source: "Shop" },
    { item: "Cement (50kg)", cat: "Construction", unit: "50kg bag", price: 720, county: "Nairobi", town: "Embakasi", source: "Shop" },
    { item: "Sugar (1kg)", cat: "Food", unit: "1kg", price: 165, county: "Nairobi", town: "Westlands", source: "Shop" },
    { item: "Cooking oil (1L)", cat: "Food", unit: "1 litre", price: 310, county: "Nairobi", town: "Kasarani", source: "Shop" },
    { item: "Petrol (per litre)", cat: "Transport", unit: "litre", price: 193, county: "Nairobi", town: "Nairobi Central", source: "Fuel station" },
    { item: "Milk (500ml)", cat: "Food", unit: "500ml", price: 65, county: "Kiambu", town: "Ruiru", source: "Shop" },
    { item: "Maize (90kg bag)", cat: "Agriculture", unit: "90kg bag", price: 4800, county: "Nakuru", town: "Nakuru", source: "Market" },
    { item: "LPG refill (6kg)", cat: "Energy", unit: "6kg", price: 950, county: "Mombasa", town: "Nyali", source: "Shop" },
  ];

  for (let i = 0; i < prices.length; i++) {
    const p = prices[i];
    await prisma.priceSubmission.create({
      data: {
        submittedById: users[i % users.length].id,
        category: p.cat,
        itemName: p.item,
        unit: p.unit,
        price: p.price,
        county: p.county,
        town: p.town,
        source: p.source,
        status: "ACTIVE",
        isVerified: i % 2 === 0,
        verifiedAt: i % 2 === 0 ? new Date() : null,
        verifiedById: i % 2 === 0 ? admin.id : null,
      },
    });
  }
  console.log(`  ✓ ${prices.length} price submissions`);

  await prisma.report.deleteMany({ where: { reporterId: { in: users.map((u) => u.id) } } });

  const reports = [
    { type: "SCAM", targetType: "Listing", reason: "Asks for deposit before viewing", status: "PENDING" },
    { type: "FAKE_LISTING", targetType: "Listing", reason: "Photos do not match the property", status: "UNDER_REVIEW" },
    { type: "ABUSE", targetType: "User", reason: "Abusive messages after enquiry", status: "RESOLVED" },
    { type: "SPAM", targetType: "Service", reason: "Repeated duplicate service posts", status: "PENDING" },
  ];

  for (let i = 0; i < reports.length; i++) {
    await prisma.report.create({
      data: {
        reporterId: users[i % users.length].id,
        type: reports[i].type,
        targetType: reports[i].targetType,
        targetId: createdListings[i % createdListings.length].id,
        reason: reports[i].reason,
        status: reports[i].status,
        reviewedAt: reports[i].status === "RESOLVED" ? new Date() : null,
        resolution: reports[i].status === "RESOLVED" ? "Warned the account owner." : null,
      },
    });
  }

  await prisma.verificationCheck.deleteMany({ where: { checkerId: admin.id } });
  await prisma.verificationCheck.create({
    data: {
      listingId: createdListings[0].id,
      checkerId: admin.id,
      type: "PROPERTY",
      status: "VERIFIED",
      notes: "Title deed and landlord ID confirmed on site visit.",
      evidence: JSON.stringify(["title-deed.pdf", "site-photo.jpg"]),
    },
  });

  await prisma.notification.deleteMany({ where: { userId: { in: users.map((u) => u.id) } } });
  for (const u of users.slice(0, 2)) {
    await prisma.notification.create({
      data: {
        userId: u.id,
        type: "SYSTEM",
        title: "Welcome to MtaaHub",
        message: "Complete your profile to get better matches in your mtaa.",
      },
    });
  }

  console.log("🎉 Seed complete");
  console.log("   Admin login: admin@mtaahub.co.ke / Password123!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
