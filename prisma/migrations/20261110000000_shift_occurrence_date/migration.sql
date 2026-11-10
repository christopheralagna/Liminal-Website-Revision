BEGIN;
LOCK TABLE "Shift" IN ACCESS EXCLUSIVE MODE;

-- No original date was previously recorded. Only the two deterministic seed IDs
-- have established provenance. Matching an arbitrary row to its current rule is
-- insufficient evidence: it could have been rescheduled by a whole week.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "Shift" s WHERE s."patternId" IS NOT NULL AND NOT (
      (s.id = 'b4000000-0000-4000-8000-000000000400'::uuid
       AND s."patternId" = 'b4000000-0000-4000-8000-000000000300'::uuid
       AND s."definitionId" = 'b4000000-0000-4000-8000-000000000200'::uuid
       AND s."startsAt" = '2027-01-04T16:00:00Z'::timestamptz
       AND s."endsAt" = '2027-01-04T19:00:00Z'::timestamptz)
      OR
      (s.id = 'b4000000-0000-4000-8000-000000000401'::uuid
       AND s."patternId" = 'b4000000-0000-4000-8000-000000000301'::uuid
       AND s."definitionId" = 'b4000000-0000-4000-8000-000000000201'::uuid
       AND s."startsAt" = '2027-01-06T16:00:00Z'::timestamptz
       AND s."endsAt" = '2027-01-06T19:00:00Z'::timestamptz)
    )
  ) THEN
    RAISE EXCEPTION 'Ambiguous preexisting recurring shifts: stop and review original occurrence dates. No dates were inferred.';
  END IF;
END $$;

ALTER TABLE "Shift" ADD COLUMN "occurrenceDate" DATE;
UPDATE "Shift" SET "occurrenceDate" = CASE id
  WHEN 'b4000000-0000-4000-8000-000000000400'::uuid THEN DATE '2027-01-04'
  WHEN 'b4000000-0000-4000-8000-000000000401'::uuid THEN DATE '2027-01-06'
END WHERE "patternId" IS NOT NULL;
CREATE UNIQUE INDEX "Shift_patternId_occurrenceDate_key" ON "Shift"("patternId", "occurrenceDate");
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_occurrence_identity"
  CHECK (("patternId" IS NULL) = ("occurrenceDate" IS NULL));

-- Protect identity even against accidental future application writes.
CREATE FUNCTION preserve_shift_occurrence_identity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."patternId" IS DISTINCT FROM OLD."patternId"
     OR NEW."occurrenceDate" IS DISTINCT FROM OLD."occurrenceDate" THEN
    RAISE EXCEPTION 'Shift recurrence identity is immutable';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "Shift_immutable_occurrence" BEFORE UPDATE ON "Shift"
  FOR EACH ROW EXECUTE FUNCTION preserve_shift_occurrence_identity();
COMMIT;
