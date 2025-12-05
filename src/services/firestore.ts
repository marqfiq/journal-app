import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../lib/firebase'
import { JournalEntry } from '../types'

const ENTRIES_COLLECTION = 'entries'
const STORAGE_BUCKET = 'journal-images'

/**
 * Generates a dayKey string (MM-DD) from a Unix timestamp in milliseconds
 */
const generateDayKey = (date: number): string => {
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

/**
 * Converts a Firestore document to a JournalEntry
 */
const documentToEntry = (doc: QueryDocumentSnapshot<DocumentData>): JournalEntry => {
  const data = doc.data()
  return {
    id: doc.id,
    userId: data.userId,
    text: data.text,
    image_urls: data.image_urls || [],
    date: data.date instanceof Timestamp ? data.date.toMillis() : data.date,
    dayKey: data.dayKey,
    mood: data.mood,
    weather: data.weather,
    location: data.location,
    tags: data.tags || [],
    music: data.music,
  }
}

/**
 * Converts a JournalEntry to Firestore document data
 */
const entryToDocument = (entry: Omit<JournalEntry, 'id'>) => {
  return {
    ...entry,
    date: Timestamp.fromMillis(entry.date),
  }
}

/**
 * Retrieves a single journal entry by ID.
 */
export const getEntry = async (entryId: string): Promise<JournalEntry | null> => {
  const docRef = doc(db, ENTRIES_COLLECTION, entryId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return documentToEntry(docSnap as QueryDocumentSnapshot<DocumentData>)
}

/**
 * Adds a new journal entry to Firestore.
 * Automatically generates the dayKey from the provided date timestamp.
 */
export const addEntry = async (entry: Omit<JournalEntry, 'id' | 'dayKey'>): Promise<string> => {
  // Generate dayKey from the date timestamp
  const dayKey = generateDayKey(entry.date)

  const entryWithDayKey = {
    ...entry,
    dayKey,
  }

  const docRef = await addDoc(collection(db, ENTRIES_COLLECTION), entryToDocument(entryWithDayKey))
  return docRef.id
}

/**
 * Updates an existing journal entry in Firestore.
 * Automatically regenerates the dayKey from the updated date timestamp.
 */
export const updateEntry = async (entryId: string, entry: Partial<Omit<JournalEntry, 'id' | 'dayKey'>>): Promise<void> => {
  const docRef = doc(db, ENTRIES_COLLECTION, entryId)

  // If date is being updated, regenerate dayKey
  const updateData: any = { ...entry }
  if (entry.date !== undefined) {
    updateData.dayKey = generateDayKey(entry.date)
  }

  // Convert date to Timestamp if present
  if (updateData.date !== undefined) {
    updateData.date = Timestamp.fromMillis(updateData.date)
  }

  await updateDoc(docRef, updateData)
}

/**
 * Retrieves journal entries ordered by date descending.
 * @param limitCount - Maximum number of entries to return (default: no limit)
 */
export const getEntries = async (limitCount?: number): Promise<JournalEntry[]> => {
  const entriesRef = collection(db, ENTRIES_COLLECTION)

  let q = query(entriesRef, orderBy('date', 'desc'))

  if (limitCount) {
    q = query(q, limit(limitCount))
  }

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(documentToEntry)
}

/**
 * Retrieves entries from previous years on the same date (MM-DD).
 * @param date - A Date object or Unix timestamp in milliseconds
 */
export const getOnThisDay = async (date: Date | number): Promise<JournalEntry[]> => {
  // Convert date to dayKey format
  const dateValue = date instanceof Date ? date.getTime() : date
  const dayKey = generateDayKey(dateValue)

  const entriesRef = collection(db, ENTRIES_COLLECTION)
  const q = query(entriesRef, where('dayKey', '==', dayKey), orderBy('date', 'desc'))

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(documentToEntry)
}

/**
 * Uploads an image file to Firebase Storage and returns the public download URL.
 * Files are stored in the 'journal-images' folder within the storage bucket.
 * @param file - The image file to upload
 * @param userId - The user ID to organize files (optional, can be added to path)
 * @returns The public download URL of the uploaded image
 */
export const uploadImage = async (file: File, userId?: string): Promise<string> => {
  // Create a unique filename with timestamp to avoid collisions
  const timestamp = Date.now()
  const fileName = `${timestamp}-${file.name}`

  // Build the path within the journal-images folder
  // Include userId in path if provided for better organization
  const path = userId
    ? `${STORAGE_BUCKET}/${userId}/${fileName}`
    : `${STORAGE_BUCKET}/${fileName}`

  const storageRef = ref(storage, path)

  // Upload the file
  await uploadBytes(storageRef, file)

  // Get the public download URL
  const downloadURL = await getDownloadURL(storageRef)

  return downloadURL
}

