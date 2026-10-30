import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "counties";
    const county = searchParams.get("county");
    const town = searchParams.get("town");

    if (type === "counties") {
      // Get distinct counties from Location model
      const locations = await prisma.location.findMany({
        where: {
          town: "",
          estate: "",
        },
        select: {
          county: true,
        },
        distinct: ["county"],
        orderBy: { county: "asc" },
      });

      // Get count of towns for each county
      const countiesWithCounts = await Promise.all(
        locations.map(async (loc) => {
          const townsCount = await prisma.location.count({
            where: {
              county: loc.county,
              town: { not: "" },
              estate: "",
            },
          });
          return {
            name: loc.county,
            _count: { towns: townsCount },
          };
        })
      );

      return NextResponse.json({ data: countiesWithCounts });
    }

    if (type === "towns") {
      if (!county) {
        return NextResponse.json({ error: "County parameter required" }, { status: 400 });
      }

      // Get distinct towns for a given county
      const locations = await prisma.location.findMany({
        where: {
          county,
          town: { not: "" },
          estate: "",
        },
        select: {
          town: true,
        },
        distinct: ["town"],
        orderBy: { town: "asc" },
      });

      const townsWithCounts = await Promise.all(
        locations.map(async (loc) => {
          const estatesCount = await prisma.location.count({
            where: {
              county,
              town: loc.town,
              estate: { not: "" },
            },
          });
          return {
            name: loc.town,
            county: { name: county },
            _count: { estates: estatesCount },
          };
        })
      );

      return NextResponse.json({ data: townsWithCounts });
    }

    if (type === "estates") {
      if (!county || !town) {
        return NextResponse.json({ error: "County and town parameters required" }, { status: 400 });
      }

      // Get distinct estates for a given county and town
      const locations = await prisma.location.findMany({
        where: {
          county,
          town,
          estate: { not: "" },
        },
        select: {
          estate: true,
        },
        distinct: ["estate"],
        orderBy: { estate: "asc" },
      });

      const estates = locations.map((loc) => ({
        name: loc.estate,
        town: { name: town, county: { name: county } },
      }));

      return NextResponse.json({ data: estates });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Locations GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}