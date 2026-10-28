{
  "indexes": [
    {
      "collectionGroup": "schools",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "school_code", "order": "ASCENDING" },
        { "fieldPath": "province", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "students",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "school_id", "order": "ASCENDING" },
        { "fieldPath": "student_id", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "lessons",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "school_id", "order": "ASCENDING" },
        { "fieldPath": "grade", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "lessons",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "school_id", "order": "ASCENDING" },
        { "fieldPath": "subject", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
firebase deploy --only firestore:indexes
cd ~