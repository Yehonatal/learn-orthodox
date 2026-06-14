import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";
import fs from "fs";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const SECTIONS_METADATA = [
  { slug: 'opening-hymns', order_index: 1, name_en: 'Opening Hymns', name_am: 'የመክፈቻ መዝሙሮች' },
  { slug: 'trisagion', order_index: 2, name_en: 'Trisagion', name_am: 'ቅዱስ ቅዱስ' },
  { slug: 'prayer-of-thanksgiving', order_index: 3, name_en: 'Prayer of Thanksgiving', name_am: 'የምስጋና ጸሎት' },
  { slug: 'prayer-of-oblation', order_index: 4, name_en: 'Prayer of Oblation', name_am: 'የቅዳሴ ጸሎት' },
  { slug: 'litany-of-intercessions', order_index: 5, name_en: 'Litany of Intercessions', name_am: 'የምልጃ ጸሎቶች' },
  { slug: 'marian-hymns', order_index: 6, name_en: 'Marian Hymns', name_am: 'የማርያም መዝሙሮች' },
  { slug: 'sanctus', order_index: 7, name_en: 'Sanctus', name_am: 'ሳንክቱስ' },
  { slug: 'anaphora', order_index: 8, name_en: 'Anaphora', name_am: 'አናፎራ' },
  { slug: 'prayer-of-fraction', order_index: 9, name_en: 'Prayer of Fraction', name_am: 'የቁርባን ጸሎት' },
  { slug: 'lords-prayer', order_index: 10, name_en: 'Lord\'s Prayer', name_am: 'አቡነ ዘበሰማያት' },
  { slug: 'communion', order_index: 11, name_en: 'Communion', name_am: 'ቅዱስ ቁርባን' },
  { slug: 'thanksgiving-dismissal', order_index: 12, name_en: 'Thanksgiving & Dismissal', name_am: 'የምስጋናና የመሸኛ ጸሎቶች' }
];

function pageToSection(page: number): string {
  if (page >= 1 && page <= 7) return 'opening-hymns';
  if (page >= 8 && page <= 13) return 'trisagion';
  if (page >= 14 && page <= 30) return 'prayer-of-thanksgiving';
  if (page >= 31 && page <= 46) return 'prayer-of-oblation';
  if (page >= 47 && page <= 70) return 'litany-of-intercessions';
  if (page >= 100 && page <= 114) return 'marian-hymns';
  if (page >= 115 && page <= 123) return 'sanctus';
  if (page >= 124 && page <= 203) return 'anaphora';
  if (page >= 204 && page <= 207) return 'prayer-of-fraction';
  if (page >= 208 && page <= 210) return 'lords-prayer';
  if (page >= 211 && page <= 239) return 'communion';
  return 'thanksgiving-dismissal';
}

async function ensureTablesExist() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  
  // 1. Check if the table exists by calling the REST API
  try {
    const { error } = await supabase.from("liturgies").select("id").limit(1);
    if (!error) {
      console.log("Database tables verified. 'liturgies' table exists.");
      return;
    }
    
    // If table doesn't exist, it will return error code 'PGRST205'
    if (error.code !== 'PGRST205') {
      console.error("Unexpected database check error:", error);
      return;
    }
  } catch (e) {
    // Ignore and proceed to connection check
  }

  // 2. If tables don't exist, try local database connection first
  let connectionString = process.env.DATABASE_URL;
  const isLocal = supabaseUrl.includes("localhost") || supabaseUrl.includes("127.0.0.1");
  
  if (!connectionString && isLocal) {
    connectionString = "postgres://postgres:postgres@localhost:54322/postgres";
    console.log(`Tables not found. Local Supabase detected. Attempting direct migration via: ${connectionString}`);
  }
  
  if (connectionString) {
    const client = new Client({ connectionString });
    try {
      await client.connect();
      console.log("Initializing database schema from migrations...");
      
      const migration1Path = path.join(process.cwd(), "supabase/migrations/001_liturgy_schema.sql");
      const migration2Path = path.join(process.cwd(), "supabase/migrations/002_enable_vector.sql");
      
      if (fs.existsSync(migration1Path)) {
        console.log("Applying 001_liturgy_schema.sql...");
        await client.query(fs.readFileSync(migration1Path, "utf-8"));
      }
      if (fs.existsSync(migration2Path)) {
        console.log("Applying 002_enable_vector.sql...");
        await client.query(fs.readFileSync(migration2Path, "utf-8"));
      }
      
      console.log("Database schema successfully initialized!");
      return;
    } catch (err: any) {
      console.error("Direct connection migration failed:", err.message || err);
    } finally {
      await client.end();
    }
  }

  // 3. If remote and no DATABASE_URL could be used successfully, print detailed SQL Editor instructions
  const match = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
  const ref = match ? match[1] : "<your-project-ref>";
  
  console.log("\n======================================================================");
  console.log("⚠️  DATABASE SCHEMA NOT INITIALIZED");
  console.log("======================================================================");
  console.log("The required tables ('liturgies', 'liturgy_sections', etc.) do not exist.");
  console.log("Because remote Supabase projects are IPv6-only by default and direct Postgres");
  console.log("connections may fail from IPv4-only networks, please run the migrations");
  console.log("directly inside the Supabase SQL Editor:");
  console.log(`\n1. Go to: https://supabase.com/dashboard/project/${ref}/sql/new`);
  console.log("2. Copy the contents of 'supabase/migrations/001_liturgy_schema.sql' and run it.");
  console.log("3. Copy the contents of 'supabase/migrations/002_enable_vector.sql' and run it.");
  console.log("4. Once applied, run this seed script again.");
  console.log("======================================================================\n");
  
  throw new Error("Database schema missing. Please run migrations in SQL Editor to proceed.");
}

async function seed() {
  await ensureTablesExist();
  console.log("Seeding Qiddase St. Dioscoros...");

  // 1. Upsert Liturgy
  const { data: liturgy, error: liturgyError } = await supabase
    .from("liturgies")
    .upsert(
      {
        slug: "qiddase-dioscoros",
        name_en: "The Divine Liturgy of St. Dioscoros",
        name_am: "ቅዳሴ ዲዮስቆሮስ",
        saint: "St. Dioscoros",
        source_pdf_path: "liturgy-pdfs/kidasse_Dioscoros.pdf",
      },
      { onConflict: "slug" }
    )
    .select()
    .single();

  if (liturgyError) {
    console.error("Liturgy seeding error:", liturgyError);
    throw liturgyError;
  }

  console.log(`Liturgy seeded: ${liturgy.id}`);

  // 2. Upsert Sections
  const sectionMap: Record<string, string> = {};
  for (const s of SECTIONS_METADATA) {
    const { data: secRow, error: secError } = await supabase
      .from("liturgy_sections")
      .upsert(
        {
          liturgy_id: liturgy.id,
          slug: s.slug,
          order_index: s.order_index,
          name_en: s.name_en,
          name_am: s.name_am
        },
        { onConflict: "liturgy_id,order_index" }
      )
      .select()
      .single();

    if (secError) {
      console.error(`Section ${s.slug} seeding error:`, secError);
      throw secError;
    }
    sectionMap[s.slug] = secRow.id;
  }

  console.log("Sections seeded.");

  // 3. Load units from sections.json
  const unitsPath = path.join(
    process.cwd(),
    "content/liturgy/qiddase-dioscoros/sections.json"
  );
  if (!fs.existsSync(unitsPath)) {
    throw new Error(`sections.json not found at ${unitsPath}`);
  }

  const rawUnits = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));
  const sectionOrder: Record<string, number> = {};

  const batch: any[] = [];
  let seededCount = 0;

  for (const unit of rawUnits) {
    const page = unit.sourcePage || 1;
    const secSlug = pageToSection(page);
    const sectionId = sectionMap[secSlug];

    if (!sectionId) continue;

    if (!sectionOrder[secSlug]) {
      sectionOrder[secSlug] = 0;
    }
    sectionOrder[secSlug]++;

    // Map role safely
    let role = unit.role;
    if (role === 'narrator') role = 'rubric';
    if (role === 'priest_and_congregation') role = 'all';
    if (role === 'priest_and_deacon') role = 'all';
    if (role === 'deacon_and_congregation') role = 'all';
    if (role === 'assistant_priest') role = 'asst_priest';

    const validRoles = ['priest', 'asst_priest', 'deacon', 'congregation', 'rubric', 'cantor', 'all'];
    if (!validRoles.includes(role)) {
      role = 'all';
    }

    batch.push({
      section_id: sectionId,
      order_index: sectionOrder[secSlug],
      source_page: page,
      role: role,
      text_gez: unit.textGez || null,
      text_am: unit.textAm || null,
      text_en: unit.textEn || null,
      is_response: false,
      notes: null
    });

    if (batch.length >= 50) {
      const { error: unitError } = await supabase
        .from("liturgy_units")
        .upsert(batch, { onConflict: "section_id,order_index" });

      if (unitError) {
        console.error("Units batch insert error:", unitError);
        throw unitError;
      }
      seededCount += batch.length;
      batch.length = 0;
    }
  }

  if (batch.length > 0) {
    const { error: unitError } = await supabase
      .from("liturgy_units")
      .upsert(batch, { onConflict: "section_id,order_index" });

    if (unitError) {
      console.error("Final units batch insert error:", unitError);
      throw unitError;
    }
    seededCount += batch.length;
  }

  console.log(`Seeded ${seededCount} liturgy units successfully!`);

  // Seed video lessons
  await seedVideos();

  // Seed orthodox lessons and church fathers
  await seedLessonsAndFathers();
}

async function seedVideos() {
  console.log("Seeding Video Lessons...");
  const videosPath = path.join(process.cwd(), "content/videos/localVideoData.js");
  if (!fs.existsSync(videosPath)) {
    console.warn("localVideoData.js not found at " + videosPath);
    return;
  }
  const videosContent = fs.readFileSync(videosPath, "utf-8");
  const jsonMatch = videosContent.match(/\[([\s\S]*?)\]/);
  if (!jsonMatch) {
    throw new Error("Could not find array in localVideoData.js");
  }

  // Safe parsing using new Function to execute JS array literal evaluation
  const rawVideos = new Function(`return ${jsonMatch[0]}`)();

  const batch: any[] = [];
  for (const video of rawVideos) {
    const youtubeId = video["YouTube Video ID"];
    const startTime = parseInt(video["Start Time (seconds)"] || "0", 10);
    const title = video["Video Title"];
    const teacherName = video["Teacher Name"] || null;
    const priority = parseInt(video["Priority"] || "0", 10);
    const subject = video["Subject"] || "የተለያዩ ጥያቄዎች";

    // Format subjects to match the screenshot tags
    let mappedSubject = subject.trim();
    if (mappedSubject === "ሀልዎተ እግዚአብሔር" || mappedSubject === "ሀለዎተ እግዚአብሔር") {
      mappedSubject = "ህልውና እግዚአብሔር";
    } else if (mappedSubject === "ነገረ ድህነት") {
      mappedSubject = "ነገረ ድኅነት";
    } else if (mappedSubject === "አዕማደ ምሥጢር") {
      mappedSubject = "አዕማደ ምስጢር";
    }

    batch.push({
      youtube_video_id: youtubeId,
      start_time: startTime,
      title: title,
      teacher_name: teacherName,
      priority: priority,
      subject: mappedSubject
    });
  }

  // Clear existing videos first
  const { error: deleteError } = await supabase
    .from("video_lessons")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (deleteError) {
    console.error("Error clearing video lessons:", deleteError);
  }

  const { error: insertError } = await supabase
    .from("video_lessons")
    .insert(batch);

  if (insertError) {
    console.error("Error inserting video lessons:", insertError);
    throw insertError;
  }

  console.log(`Seeded ${batch.length} video lessons successfully!`);
}

async function seedLessonsAndFathers() {
  console.log("Seeding Orthodox Lessons & Church Fathers...");
  
  // 1. Seed Orthodox Lessons
  const lessonsPath = path.join(process.cwd(), "content/lessons/am/basic_teaching.json");
  if (!fs.existsSync(lessonsPath)) {
    console.warn("basic_teaching.json not found at " + lessonsPath);
    return;
  }
  const lessonsData = JSON.parse(fs.readFileSync(lessonsPath, "utf-8"));
  const chapters = lessonsData.chapters || [];
  
  const lessonSlugs = [
    "halwote-egziabher", 
    "sine-fitret", 
    "sew-lij-wudqet", 
    "haymanot-dogma-qenona", 
    "aemade-mesitir", 
    "dihnet-be-christos", 
    "menfes-qidus", 
    "bete-christian-mininet", 
    "sebat-mesitirat", 
    "qidusan-mezaft-and-tiwfit", 
    "dengil-maryam", 
    "kidusan-semayat-amalajinet", 
    "tsolot-and-tsom", 
    "sine-migbar"
  ];

  const lessonBatch = chapters.map((ch: any, idx: number) => ({
    slug: lessonSlugs[idx] || `lesson-${idx + 1}`,
    title: ch.title,
    description: ch.description
  }));

  // Clear existing lessons
  const { error: deleteLessonsError } = await supabase
    .from("orthodox_lessons")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteLessonsError) {
    console.error("Error clearing orthodox lessons:", deleteLessonsError);
  }

  // Insert lessons
  const { error: insertLessonsError } = await supabase
    .from("orthodox_lessons")
    .insert(lessonBatch);
  if (insertLessonsError) {
    console.error("Error inserting orthodox lessons:", insertLessonsError);
    throw insertLessonsError;
  }
  console.log(`Seeded ${lessonBatch.length} orthodox lessons successfully!`);

  // 2. Seed Church Fathers
  const fathersPath = path.join(process.cwd(), "content/lessons/en/churchfathers_data.json");
  if (!fs.existsSync(fathersPath)) {
    console.warn("churchfathers_data.json not found at " + fathersPath);
    return;
  }
  const fathersData = JSON.parse(fs.readFileSync(fathersPath, "utf-8"));
  const fatherBatch: any[] = [];
  
  for (const [category, fathersList] of Object.entries(fathersData)) {
    if (Array.isArray(fathersList)) {
      for (const father of fathersList) {
        fatherBatch.push({
          name: father.name,
          category: category,
          pdf_link: father.pdf_link
        });
      }
    }
  }

  // Clear existing fathers
  const { error: deleteFathersError } = await supabase
    .from("church_fathers")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteFathersError) {
    console.error("Error clearing church fathers:", deleteFathersError);
  }

  // Insert fathers
  const { error: insertFathersError } = await supabase
    .from("church_fathers")
    .insert(fatherBatch);
  if (insertFathersError) {
    console.error("Error inserting church fathers:", insertFathersError);
    throw insertFathersError;
  }
  console.log(`Seeded ${fatherBatch.length} church fathers successfully!`);
}

seed().catch((err) => {
  console.error("Seeding process failed:", err);
  process.exit(1);
});


