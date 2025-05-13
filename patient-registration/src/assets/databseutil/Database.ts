import { PGlite } from '@electric-sql/pglite'
import { PGliteWorker } from '@electric-sql/pglite/worker'

let db: PGliteWorker | null = null

const creationschema = async (database: PGliteWorker) => {
  await database.query(`
    CREATE TABLE IF NOT EXISTS patients (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
       email TEXT,
      age TEXT NOT NULL,
      phone TEXT,
      gender TEXT,
      address TEXT,
      emergencyContact TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await database.query(`
    CREATE INDEX IF NOT EXISTS idx_patient_name ON patients (email,name);
  `);

  console.log("Database schema initialized");
};

export const initDatabase = async (): Promise<PGliteWorker> => {
  if (!db) {
    try {
      const workerInstance = new Worker(new URL('/pglite.js', import.meta.url), {
        type: 'module',
      });
      db = new PGliteWorker(workerInstance);
      await creationschema(db);
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }
  return db;
};

export const registation = async (patientData: any): Promise<any> => {
  const database = await initDatabase();
  const {
    name,
 email,
    age,
    phone,
    gender ,
    address ,
    emergencyContact
  
  } = patientData;

  const result = await database.query(
    `INSERT INTO patients 
      (name,email,age,phone,gender,address,emergencyContact) 
     VALUES 
      ($1, $2, $3, $4,$5,$6,$7)
     RETURNING id`,
    [
      name,
      email || null,
      age,
      phone || null,
      gender || null,
      address|| null,
      emergencyContact||null
    ]
  );

  return result.rows?.[0];
};

export const getAllPatients = async (): Promise<any[]> => {
  const database = await initDatabase();
  try {
    const result = await database.query(
      "SELECT * FROM patients ORDER BY name"
    );
    return result.rows || [];
  } catch (error) {
    console.error('Error executing getAllPatients query:', error);
    throw error;
  }
};


export const executeQuery = async (
  sqlQuery: string,
  params: any[] = []
): Promise<any> => {
  try {
    const database = await initDatabase();
    const result = await database.query(sqlQuery, params);
    return { success: true, data: result.rows || [], error: null };
  } catch (error: any) {
    console.error("Query execution error:", error);
    return {
      success: false,
      data: [],
      error: error.message || "An error occurred while executing the query",
    };
  }
};
