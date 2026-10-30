import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const searchSchema = z.object({
  q: z.string().optional(),
  services: z.array(z.enum(["listings", "jobs", "services", "prices"])).optional(),
  county: z.string().optional(),
  town: z.string().optional(),
  estate: z.string().optional(),
  limit: z.number().int().positive().max(50).default(10),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const services = searchParams.get("services")?.split(",").filter(Boolean) || ["listings", "jobs", "services", "prices"];
    const county = searchParams.get("county");
    const town = searchParams.get("town");
    const estate = searchParams.get("estate");
    const limit = parseInt(searchParams.get("limit") || "10");

    const results: any = {};

    // Build location filter for models with location relation
    const locationFilter: any = {};
    if (county || town || estate) {
      locationFilter.location = {};
      if (county) locationFilter.location.county = county;
      if (town) locationFilter.location.town = town;
      if (estate) locationFilter.location.estate = estate;
    }

    const serviceSearch = q
      ? { OR: [{ name: { contains: q } }, { description: { contains: q } }, { subcategory: { contains: q } }] }
      : {};

    const searchFilter = q
      ? {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : {};

    // Search listings (NyumbaHub)
    if (services.includes("listings")) {
      const listings = await prisma.listing.findMany({
        where: {
          status: "ACTIVE",
          ...searchFilter,
          ...locationFilter,
        },
        include: {
          user: { select: { id: true, displayName: true, image: true } },
          location: { select: { county: true, town: true, estate: true } },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      });
      results.listings = listings;
    }

    // Search jobs (KaziHub)
    if (services.includes("jobs")) {
      const jobs = await prisma.jobPost.findMany({
        where: {
          status: "ACTIVE",
          ...searchFilter,
          ...locationFilter,
        },
        include: {
          postedBy: { select: { id: true, displayName: true, image: true } },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      });
      results.jobs = jobs;
    }

    // Search services (Mtaani)
    if (services.includes("services")) {
      const servicesData = await prisma.serviceProvider.findMany({
        where: {
          verificationStatus: "VERIFIED",
          ...serviceSearch,
          ...locationFilter,
        },
        include: {
          user: { select: { id: true, displayName: true, image: true } },
          location: { select: { county: true, town: true, estate: true } },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      });
      results.services = servicesData;
    }

    // Search prices (BeiSmart)
    if (services.includes("prices")) {
      const prices = await prisma.priceSubmission.findMany({
        where: {
          status: "ACTIVE",
          ...(q ? { itemName: { contains: q } } : {}),
          ...(county ? { county } : {}),
          ...(town ? { town } : {}),
        },
        include: {
          submittedBy: { select: { id: true, displayName: true, image: true } },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      });
      results.prices = prices;
    }

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("Search GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}