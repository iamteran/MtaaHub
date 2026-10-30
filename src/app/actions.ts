"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isValidKenyanPhone } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function str(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function num(form: FormData, key: string): number | null {
  const raw = str(form, key).replace(/[^0-9.]/g, "");
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function bool(form: FormData, key: string): boolean {
  const v = form.get(key);
  return v === "on" || v === "true" || v === "1";
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  return session.user;
}

async function ensureLocation(county: string, town: string, estate: string): Promise<string | null> {
  if (!county) return null;
  try {
    const location = await prisma.location.upsert({
      where: { county_town_estate: { county, town, estate } },
      update: {},
      create: { county, town, estate },
    });
    return location.id;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Account                                                                    */
/* -------------------------------------------------------------------------- */

export async function updateDisplayName(formData: FormData) {
  const user = await requireUser();
  const displayName = str(formData, "displayName");

  if (displayName.length < 2) fail("/profile", "Display name must be at least 2 characters.");
  if (displayName.length > 40) fail("/profile", "Display name must be under 40 characters.");

  const taken = await prisma.user.findFirst({
    where: { displayName, NOT: { id: user.id } },
    select: { id: true },
  });
  if (taken) fail("/profile", "That display name is already taken.");

  await prisma.user.update({
    where: { id: user.id },
    data: { displayName, phone: str(formData, "phone") || null, county: str(formData, "county") || null, town: str(formData, "town") || null },
  });

  revalidatePath("/profile");
  redirect("/profile?saved=1");
}

/* -------------------------------------------------------------------------- */
/*  Listings                                                                   */
/* -------------------------------------------------------------------------- */

export async function createListing(formData: FormData) {
  const user = await requireUser();

  const title = str(formData, "title");
  const description = str(formData, "description");
  const propertyType = str(formData, "propertyType");
  const county = str(formData, "county");
  const town = str(formData, "town");
  const estate = str(formData, "estate");
  const rent = num(formData, "rent");
  const deposit = num(formData, "deposit");
  const contactPhone = str(formData, "contactPhone");
  const amenities = formData.getAll("amenities").map(String).filter(Boolean);

  if (title.length < 5) fail("/nyumba/list", "Give your listing a title of at least 5 characters.");
  if (description.length < 20) fail("/nyumba/list", "Describe the property in at least 20 characters.");
  if (!propertyType) fail("/nyumba/list", "Choose a property type.");
  if (!county) fail("/nyumba/list", "Choose a county.");
  if (!rent || rent <= 0) fail("/nyumba/list", "Enter the monthly rent in KSh.");
  if (!isValidKenyanPhone(contactPhone)) fail("/nyumba/list", "Enter a valid Kenyan phone number, e.g. 0712 345 678.");

  const locationId = await ensureLocation(county, town, estate);

  const listing = await prisma.listing.create({
    data: {
      userId: user.id,
      locationId,
      title,
      description,
      propertyType,
      bedrooms: num(formData, "bedrooms"),
      bathrooms: num(formData, "bathrooms"),
      rent,
      deposit,
      amenities: JSON.stringify(amenities),
      images: "[]",
      status: "ACTIVE",
      contactPhone,
      contactWhatsApp: bool(formData, "contactWhatsApp"),
      contactEmail: bool(formData, "contactEmail"),
    },
  });

  await prisma.auditLog.create({
    data: { userId: user.id, action: "CREATE", entity: "Listing", entityId: listing.id, newData: JSON.stringify({ title }) },
  });

  revalidatePath("/nyumba");
  redirect(`/nyumba/${listing.id}?created=1`);
}

/* -------------------------------------------------------------------------- */
/*  Jobs                                                                       */
/* -------------------------------------------------------------------------- */

export async function createJob(formData: FormData) {
  const user = await requireUser();

  const title = str(formData, "title");
  const companyName = str(formData, "companyName");
  const description = str(formData, "description");
  const jobType = str(formData, "jobType");
  const category = str(formData, "category");
  const county = str(formData, "county");
  const town = str(formData, "town");

  if (title.length < 5) fail("/jobs/post", "Give the role a title of at least 5 characters.");
  if (description.length < 20) fail("/jobs/post", "Describe the role in at least 20 characters.");
  if (!jobType) fail("/jobs/post", "Choose a job type.");
  if (!county) fail("/jobs/post", "Choose a county.");

  const job = await prisma.jobPost.create({
    data: {
      postedById: user.id,
      title,
      companyName: companyName || null,
      description,
      jobType,
      category: category || "Other",
      county,
      town: town || null,
      isRemote: bool(formData, "isRemote"),
      salaryMin: num(formData, "salaryMin"),
      salaryMax: num(formData, "salaryMax"),
      salaryPeriod: "MONTHLY",
      applicationUrl: str(formData, "applicationUrl") || null,
      applicationEmail: str(formData, "applicationEmail") || null,
      applicationPhone: str(formData, "applicationPhone") || null,
      status: "ACTIVE",
    },
  });

  revalidatePath("/jobs");
  redirect(`/jobs/${job.id}?created=1`);
}

/* -------------------------------------------------------------------------- */
/*  Services                                                                   */
/* -------------------------------------------------------------------------- */

export async function createService(formData: FormData) {
  const user = await requireUser();

  const name = str(formData, "name");
  const category = str(formData, "category");
  const description = str(formData, "description");
  const phone = str(formData, "phone");
  const county = str(formData, "county");
  const town = str(formData, "town");

  if (name.length < 3) fail("/services/register", "Enter the name of your business or service.");
  if (!category) fail("/services/register", "Choose a category.");
  if (description.length < 20) fail("/services/register", "Describe your service in at least 20 characters.");
  if (!isValidKenyanPhone(phone)) fail("/services/register", "Enter a valid Kenyan phone number.");

  const existing = await prisma.serviceProvider.findFirst({ where: { userId: user.id } });
  if (existing) fail("/services/register", "You already have a service profile.");

  const locationId = await ensureLocation(county, town, "");
  const areas = formData.getAll("areas").map(String).filter(Boolean);

  await prisma.serviceProvider.create({
    data: {
      userId: user.id,
      locationId,
      name,
      category,
      subcategory: str(formData, "subcategory") || null,
      description,
      phone,
      whatsapp: true,
      email: str(formData, "email") || null,
      areasServed: JSON.stringify(areas),
      pricing: str(formData, "pricing") || null,
      businessHours: str(formData, "businessHours") || null,
      images: "[]",
      verificationStatus: "PENDING",
    },
  });

  revalidatePath("/services");
  redirect("/services/register?submitted=1");
}

/* -------------------------------------------------------------------------- */
/*  Prices                                                                     */
/* -------------------------------------------------------------------------- */

export async function submitPrice(formData: FormData) {
  const user = await requireUser();

  const itemName = str(formData, "itemName");
  const unit = str(formData, "unit");
  const price = num(formData, "price");
  const county = str(formData, "county");
  const category = str(formData, "category");

  if (itemName.length < 2) fail("/prices/submit", "Enter the item name.");
  if (!unit) fail("/prices/submit", "Enter the unit, e.g. 2kg packet.");
  if (!price || price <= 0) fail("/prices/submit", "Enter a valid price in KSh.");
  if (!county) fail("/prices/submit", "Choose a county.");

  await prisma.priceSubmission.create({
    data: {
      submittedById: user.id,
      category: category || "Other",
      itemName,
      brand: str(formData, "brand") || null,
      unit,
      price,
      county,
      town: str(formData, "town") || null,
      source: str(formData, "source") || "Shop",
      notes: str(formData, "notes") || null,
      status: "ACTIVE",
    },
  });

  revalidatePath("/prices");
  redirect("/prices?submitted=1");
}

/* -------------------------------------------------------------------------- */
/*  Favourites                                                                 */
/* -------------------------------------------------------------------------- */

export async function toggleFavourite(listingId: string) {
  const user = await requireUser();

  const existing = await prisma.favourite.findUnique({
    where: { userId_listingId: { userId: user.id, listingId } },
  });

  if (existing) {
    await prisma.favourite.delete({ where: { id: existing.id } });
    await prisma.listing.update({ where: { id: listingId }, data: { favouriteCount: { decrement: 1 } } }).catch(() => null);
  } else {
    await prisma.favourite.create({ data: { userId: user.id, listingId } });
    await prisma.listing.update({ where: { id: listingId }, data: { favouriteCount: { increment: 1 } } }).catch(() => null);
  }

  revalidatePath(`/nyumba/${listingId}`);
  revalidatePath("/dashboard");
}

/* -------------------------------------------------------------------------- */
/*  Reports                                                                    */
/* -------------------------------------------------------------------------- */

export async function reportContent(formData: FormData) {
  const session = await auth();
  const targetType = str(formData, "targetType") || "Listing";
  const targetId = str(formData, "targetId");
  const type = str(formData, "type") || "OTHER";
  const reason = str(formData, "reason");

  if (reason.length < 10) fail("/safety", "Describe the issue in at least 10 characters.");

  await prisma.report.create({
    data: {
      reporterId: session?.user?.id ?? null,
      type,
      targetType,
      targetId: targetId || "unknown",
      reason,
      status: "PENDING",
    },
  });

  revalidatePath("/safety");
  redirect("/safety?reported=1");
}

/* -------------------------------------------------------------------------- */
/*  Admin                                                                      */
/* -------------------------------------------------------------------------- */

async function requireStaff() {
  const session = await auth();
  const role = session?.user?.role ?? "";
  if (!["SUPER_ADMIN", "MODERATOR", "SUPPORT_STAFF", "VERIFICATION_OFFICER"].includes(role)) {
    redirect("/dashboard");
  }
  return session!.user;
}

export async function adminUpdateReport(formData: FormData) {
  const staff = await requireStaff();
  const id = str(formData, "reportId");
  const status = str(formData, "status");
  const resolution = str(formData, "resolution");

  if (!id || !status) redirect("/admin");

  await prisma.report.update({
    where: { id },
    data: {
      status,
      resolution: resolution || null,
      reviewedBy: staff.id,
      reviewedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: { userId: staff.id, action: "UPDATE", entity: "Report", entityId: id, newData: JSON.stringify({ status }) },
  });

  revalidatePath("/admin");
}

export async function adminSetUserActive(formData: FormData) {
  const staff = await requireStaff();
  if (staff.role !== "SUPER_ADMIN" && staff.role !== "MODERATOR") redirect("/admin");

  const userId = str(formData, "userId");
  const active = str(formData, "active") === "1";
  if (!userId) redirect("/admin");

  // The schema models moderation state through `role` (no soft-delete column).
  await prisma.user.update({
    where: { id: userId },
    data: { role: active ? "USER" : "SUSPENDED" },
  });

  await prisma.auditLog.create({
    data: { userId: staff.id, action: active ? "ACTIVATE" : "SUSPEND", entity: "User", entityId: userId },
  });

  revalidatePath("/admin");
}

/* -------------------------------------------------------------------------- */
/*  Sign up                                                                    */
/* -------------------------------------------------------------------------- */

export async function registerUser(formData: FormData) {
  const email = str(formData, "email").toLowerCase();
  const password = str(formData, "password");
  const name = str(formData, "name");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("/auth/signin?mode=signup", "Enter a valid email address.");
  if (password.length < 8) fail("/auth/signin?mode=signup", "Use a password with at least 8 characters.");
  if (name.length < 2) fail("/auth/signin?mode=signup", "Tell us your name.");

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) fail("/auth/signin?mode=signin", "An account with that email already exists — sign in instead.");

  const bcrypt = (await import("bcryptjs")).default;
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name,
      displayName: name,
      passwordHash,
      emailVerified: new Date(),
    },
  });

  redirect("/auth/signin?registered=1");
}