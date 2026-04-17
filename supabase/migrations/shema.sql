SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";


CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";


CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";


CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";


CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  INSERT INTO public."Users" (user_id, email, first_name, last_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    -- Safely pulls from metadata, defaults to empty string if missing
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'username'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_trip_member"("trip_id_param" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM "Trip_Members" 
    WHERE trip_id = trip_id_param 
    AND user_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."is_trip_member"("trip_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_trip_member"("p_trip_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public."Trip_Members" tm
    where tm.trip_id = p_trip_id
      and tm.user_id = p_user_id
      and coalesce(lower(tm.status), 'accepted') in ('accepted', 'active', 'confirmed')
  );
$$;


ALTER FUNCTION "public"."is_trip_member"("p_trip_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_trip_owner"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  NEW.owner_id := auth.uid();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_trip_owner"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."shares_trip_with_user"("p_other_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public."Trip_Members" mine
    join public."Trip_Members" theirs
      on mine.trip_id = theirs.trip_id
    where mine.user_id = auth.uid()
      and theirs.user_id = p_other_user_id
      and coalesce(lower(mine.status), 'accepted') in ('accepted', 'active', 'confirmed')
      and coalesce(lower(theirs.status), 'accepted') in ('accepted', 'active', 'confirmed')
  );
$$;


ALTER FUNCTION "public"."shares_trip_with_user"("p_other_user_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."Accommodations" (
    "accommodation_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "address" character varying(255) NOT NULL,
    "check_in" timestamp with time zone NOT NULL,
    "check_out" timestamp with time zone NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "latitude" numeric,
    "longitude" numeric
);


ALTER TABLE "public"."Accommodations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Connections" (
    "connection_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_a_id" "uuid" NOT NULL,
    "user_b_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "connections_users_different" CHECK (("user_a_id" <> "user_b_id"))
);


ALTER TABLE "public"."Connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Events" (
    "event_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "address" character varying(255),
    "start_timestamp" timestamp with time zone,
    "end_timestamp" timestamp with time zone,
    "description" character varying(255),
    "trip_id" "uuid" NOT NULL,
    "title" character varying(255) NOT NULL,
    "category" character varying(100) NOT NULL,
    "longitude" numeric,
    "latitude" numeric,
    "status" character varying(255) DEFAULT 'Idea'::character varying,
    "created_by" "uuid",
    "image_id" "uuid"
);


ALTER TABLE "public"."Events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Expense_Splits" (
    "split_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "expense_id" "uuid" NOT NULL,
    "amount_owed" numeric NOT NULL
);


ALTER TABLE "public"."Expense_Splits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Expenses" (
    "expense_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "total_amount" numeric NOT NULL,
    "category" character varying(255),
    "description" character varying(255),
    "trip_id" "uuid" NOT NULL,
    "paid_by" "uuid" NOT NULL,
    "currency" character varying(255) DEFAULT 'USD'::character varying,
    "expense_date" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."Expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Journals" (
    "entry_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid",
    "title" character varying(255) NOT NULL,
    "description" "text",
    "entry_timestamp" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."Journals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Messages" (
    "message_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sender_id" "uuid",
    "body" "text" NOT NULL,
    "sent_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "trip_id" "uuid" NOT NULL
);


ALTER TABLE "public"."Messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Photos" (
    "photo_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "photo_url" "text" NOT NULL,
    "uploaded_at" timestamp with time zone,
    "upload_location" character varying(255),
    "uploader_id" "uuid",
    "trip_id" "uuid" NOT NULL,
    "entry_id" "uuid",
    "type" character varying
);


ALTER TABLE "public"."Photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Trip_Destinations" (
    "arrival_date" timestamp without time zone NOT NULL,
    "departure_date" timestamp without time zone NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "destination_id" "uuid" NOT NULL
);


ALTER TABLE "public"."Trip_Destinations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Trip_Members" (
    "user_id" "uuid" NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text",
    "status" "text" DEFAULT 'accepted'::"text"
);


ALTER TABLE "public"."Trip_Members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Trips" (
    "trip_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "creator_id" "uuid" NOT NULL,
    "trip_name" "text" NOT NULL,
    "start_date" "date",
    "end_date" "date",
    "cover_photo_url" "text",
    "target_budget" numeric DEFAULT 0,
    "vibe" "text" DEFAULT 'Relaxing'::"text",
    "default_currency" character varying DEFAULT 'USD'::character varying
);


ALTER TABLE "public"."Trips" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Users" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "email" character varying(255),
    "username" character varying(255),
    "first_name" character varying(255) NOT NULL,
    "last_name" character varying(255) NOT NULL,
    "avatar_url" "text",
    "password_hash" character varying(255) DEFAULT 'temp_hash'::character varying NOT NULL
);


ALTER TABLE "public"."Users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cached_destinations" (
    "destination_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "country" character varying(255) NOT NULL,
    "city" character varying(255),
    "cover_image_url" "text",
    "longitude" numeric,
    "latitude" numeric,
    "country_code" "text"
);


ALTER TABLE "public"."cached_destinations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "doc_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "uploader_id" "uuid",
    "file_name" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_size_bytes" bigint,
    "file_type" "text",
    "upload_timestamp" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_votes" (
    "vote_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "event_id" "uuid",
    "user_id" "uuid",
    "vote_value" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."event_votes" OWNER TO "postgres";
ALTER TABLE ONLY "public"."Accommodations"
    ADD CONSTRAINT "Accomadations_pkey" PRIMARY KEY ("accommodation_id");

ALTER TABLE ONLY "public"."Connections"
    ADD CONSTRAINT "Connections_pkey" PRIMARY KEY ("connection_id");

ALTER TABLE ONLY "public"."Events"
    ADD CONSTRAINT "Events/Activities_pkey" PRIMARY KEY ("event_id");

ALTER TABLE ONLY "public"."Expense_Splits"
    ADD CONSTRAINT "Expense_Splits_pkey" PRIMARY KEY ("split_id");

ALTER TABLE ONLY "public"."Expenses"
    ADD CONSTRAINT "Expenses_pkey" PRIMARY KEY ("expense_id");

ALTER TABLE ONLY "public"."Journals"
    ADD CONSTRAINT "Journals_pkey" PRIMARY KEY ("entry_id");

ALTER TABLE ONLY "public"."Messages"
    ADD CONSTRAINT "Messages_pkey" PRIMARY KEY ("message_id");

ALTER TABLE ONLY "public"."Photos"
    ADD CONSTRAINT "Photo_pkey" PRIMARY KEY ("photo_id");

ALTER TABLE ONLY "public"."Photos"
    ADD CONSTRAINT "Photos_photo_url_key" UNIQUE ("photo_url");

ALTER TABLE ONLY "public"."Trip_Destinations"
    ADD CONSTRAINT "Trip_Destinations_pkey" PRIMARY KEY ("trip_id", "destination_id");

ALTER TABLE ONLY "public"."Trip_Members"
    ADD CONSTRAINT "Trip_Members_pkey" PRIMARY KEY ("user_id", "trip_id");

ALTER TABLE ONLY "public"."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("user_id");

ALTER TABLE ONLY "public"."cached_destinations"
    ADD CONSTRAINT "cached_destinations_pkey" PRIMARY KEY ("destination_id");

ALTER TABLE ONLY "public"."Connections"
    ADD CONSTRAINT "connections_pair_unique" UNIQUE ("user_a_id", "user_b_id");

ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("doc_id");

ALTER TABLE ONLY "public"."event_votes"
    ADD CONSTRAINT "event_votes_event_id_user_id_key" UNIQUE ("event_id", "user_id");

ALTER TABLE ONLY "public"."event_votes"
    ADD CONSTRAINT "event_votes_pkey" PRIMARY KEY ("vote_id");

ALTER TABLE ONLY "public"."Trips"
    ADD CONSTRAINT "trips_pkey" PRIMARY KEY ("trip_id");


CREATE INDEX "messages_sender_id_idx" ON "public"."Messages" USING "btree" ("sender_id");
CREATE INDEX "messages_trip_id_sent_at_idx" ON "public"."Messages" USING "btree" ("trip_id", "sent_at");


ALTER TABLE ONLY "public"."Connections"
    ADD CONSTRAINT "Connections_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "public"."Users"("user_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Connections"
    ADD CONSTRAINT "Connections_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "public"."Users"("user_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Events"
    ADD CONSTRAINT "Events_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "public"."Photos"("photo_id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."Accommodations"
    ADD CONSTRAINT "accommodations_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."Trips"("trip_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."Trips"("trip_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "public"."Users"("user_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."event_votes"
    ADD CONSTRAINT "event_votes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."Events"("event_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."event_votes"
    ADD CONSTRAINT "event_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("user_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Events"
    ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."Users"("user_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."Events"
    ADD CONSTRAINT "events_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."Trips"("trip_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Expense_Splits"
    ADD CONSTRAINT "expense_splits_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "public"."Expenses"("expense_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Expense_Splits"
    ADD CONSTRAINT "expense_splits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("user_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Expenses"
    ADD CONSTRAINT "expenses_payer_id_fkey" FOREIGN KEY ("paid_by") REFERENCES "public"."Users"("user_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Expenses"
    ADD CONSTRAINT "expenses_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."Trips"("trip_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Journals"
    ADD CONSTRAINT "journals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."Users"("user_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."Journals"
    ADD CONSTRAINT "journals_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."Trips"("trip_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."Users"("user_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."Messages"
    ADD CONSTRAINT "messages_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."Trips"("trip_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Photos"
    ADD CONSTRAINT "photo_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "public"."Users"("user_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."Photos"
    ADD CONSTRAINT "photos_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."Journals"("entry_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."Photos"
    ADD CONSTRAINT "photos_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."Trips"("trip_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Trip_Destinations"
    ADD CONSTRAINT "trip_destinations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "public"."cached_destinations"("destination_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Trip_Destinations"
    ADD CONSTRAINT "trip_destinations_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."Trips"("trip_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Trip_Members"
    ADD CONSTRAINT "trip_members_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."Trips"("trip_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Trip_Members"
    ADD CONSTRAINT "trip_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("user_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Trips"
    ADD CONSTRAINT "trips_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."Users"("user_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."Users"
    ADD CONSTRAINT "users_auth_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."Accommodations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "All users can view all other users basic profiles" ON "public"."Users" FOR SELECT TO "authenticated" USING (true);
CREATE POLICY "Anyone can view cached destinations" ON "public"."cached_destinations" FOR SELECT TO "authenticated" USING (true);
CREATE POLICY "Authenticated users can add cached destinations" ON "public"."cached_destinations" FOR INSERT TO "authenticated" WITH CHECK (true);
CREATE POLICY "Authenticated users can create trips" ON "public"."Trips" FOR INSERT TO "authenticated" WITH CHECK (("creator_id" = "auth"."uid"()));


ALTER TABLE "public"."Connections" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Connections are viewable by either user" ON "public"."Connections" FOR SELECT USING ((("auth"."uid"() = "user_a_id") OR ("auth"."uid"() = "user_b_id")));
CREATE POLICY "Connections can be deleted by either user" ON "public"."Connections" FOR DELETE USING ((("auth"."uid"() = "user_a_id") OR ("auth"."uid"() = "user_b_id")));
CREATE POLICY "Connections can be inserted by either user" ON "public"."Connections" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_a_id") OR ("auth"."uid"() = "user_b_id")));
CREATE POLICY "Connections can be managed by participants" ON "public"."Connections" TO "authenticated" USING ((("auth"."uid"() = "user_a_id") OR ("auth"."uid"() = "user_b_id"))) WITH CHECK ((("auth"."uid"() = "user_a_id") OR ("auth"."uid"() = "user_b_id")));
CREATE POLICY "Creator can delete trip" ON "public"."Trips" FOR DELETE TO "authenticated" USING (("creator_id" = "auth"."uid"()));
CREATE POLICY "Creator can update trip" ON "public"."Trips" FOR UPDATE TO "authenticated" USING (("creator_id" = "auth"."uid"()));


ALTER TABLE "public"."Events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Expense_Splits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Expenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Journals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Members can leave or creator can remove" ON "public"."Trip_Members" FOR DELETE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_trip_member"("trip_id")));
CREATE POLICY "Members can update their own status" ON "public"."Trip_Members" FOR UPDATE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_trip_member"("trip_id")));


ALTER TABLE "public"."Messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Photos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Trip members access accommodations" ON "public"."Accommodations" TO "authenticated" USING ("public"."is_trip_member"("trip_id")) WITH CHECK ("public"."is_trip_member"("trip_id"));
CREATE POLICY "Trip members access destinations" ON "public"."Trip_Destinations" TO "authenticated" USING ("public"."is_trip_member"("trip_id")) WITH CHECK ("public"."is_trip_member"("trip_id"));
CREATE POLICY "Trip members access documents" ON "public"."documents" TO "authenticated" USING ("public"."is_trip_member"("trip_id")) WITH CHECK ("public"."is_trip_member"("trip_id"));

CREATE POLICY "Trip members access event votes" ON "public"."event_votes" TO "authenticated" USING (("event_id" IN ( SELECT "Events"."event_id"
   FROM "public"."Events"
  WHERE "public"."is_trip_member"("Events"."trip_id")))) WITH CHECK (("event_id" IN ( SELECT "Events"."event_id"
   FROM "public"."Events"
  WHERE "public"."is_trip_member"("Events"."trip_id"))));

CREATE POLICY "Trip members access events" ON "public"."Events" TO "authenticated" USING ("public"."is_trip_member"("trip_id")) WITH CHECK ("public"."is_trip_member"("trip_id"));

CREATE POLICY "Trip members access expense splits" ON "public"."Expense_Splits" TO "authenticated" USING (("expense_id" IN ( SELECT "Expenses"."expense_id"
   FROM "public"."Expenses"
  WHERE "public"."is_trip_member"("Expenses"."trip_id")))) WITH CHECK (("expense_id" IN ( SELECT "Expenses"."expense_id"
   FROM "public"."Expenses"
  WHERE "public"."is_trip_member"("Expenses"."trip_id"))));


CREATE POLICY "Trip members access expenses" ON "public"."Expenses" TO "authenticated" USING ("public"."is_trip_member"("trip_id")) WITH CHECK ("public"."is_trip_member"("trip_id"));
CREATE POLICY "Trip members access journals" ON "public"."Journals" TO "authenticated" USING ("public"."is_trip_member"("trip_id")) WITH CHECK ("public"."is_trip_member"("trip_id"));
CREATE POLICY "Trip members access messages" ON "public"."Messages" TO "authenticated" USING ("public"."is_trip_member"("trip_id")) WITH CHECK ("public"."is_trip_member"("trip_id"));
CREATE POLICY "Trip members access photos" ON "public"."Photos" TO "authenticated" USING ("public"."is_trip_member"("trip_id")) WITH CHECK ("public"."is_trip_member"("trip_id"));
CREATE POLICY "Trip members can view other members" ON "public"."Trip_Members" FOR SELECT TO "authenticated" USING ("public"."is_trip_member"("trip_id"));
CREATE POLICY "Trip members can view trips" ON "public"."Trips" FOR SELECT TO "authenticated" USING (("public"."is_trip_member"("trip_id") OR ("creator_id" = "auth"."uid"())));


ALTER TABLE "public"."Trip_Destinations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Trip_Members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Trips" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Users apart of a trip can access member data" ON "public"."Trip_Members" FOR SELECT TO "authenticated" USING ("public"."is_trip_member"("trip_id"));
CREATE POLICY "Users can add themselves or creator can add" ON "public"."Trip_Members" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_trip_member"("trip_id")));
CREATE POLICY "Users can add themselves to the trip" ON "public"."Trip_Members" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_trip_member"("trip_id") OR ("user_id" = "auth"."uid"())));
CREATE POLICY "Users can create there own profiles" ON "public"."Users" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));
CREATE POLICY "Users can delete their own trips" ON "public"."Trips" FOR DELETE TO "authenticated" USING (("creator_id" = "auth"."uid"()));
CREATE POLICY "Users can insert their own trips" ON "public"."Trips" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "creator_id"));
CREATE POLICY "Users can manage themselves" ON "public"."Users" TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));
CREATE POLICY "Users can read all basic profiles" ON "public"."Users" FOR SELECT TO "authenticated" USING (true);
CREATE POLICY "Users can read self or trip members" ON "public"."Users" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."shares_trip_with_user"("user_id")));
CREATE POLICY "Users can remove themselves from a trip" ON "public"."Trip_Members" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));
CREATE POLICY "Users can see trips they are apart of" ON "public"."Trips" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "creator_id") OR "public"."is_trip_member"("trip_id")));
CREATE POLICY "Users can update self" ON "public"."Users" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));
CREATE POLICY "Users can update their own profile" ON "public"."Users" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));
CREATE POLICY "Users can update their own trips" ON "public"."Trips" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "creator_id") OR "public"."is_trip_member"("trip_id"))) WITH CHECK ((("auth"."uid"() = "creator_id") OR "public"."is_trip_member"("trip_id")));


ALTER TABLE "public"."cached_destinations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."event_votes" ENABLE ROW LEVEL SECURITY;


ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."is_trip_member"("trip_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_trip_member"("trip_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_trip_member"("trip_id_param" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."is_trip_member"("p_trip_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_trip_member"("p_trip_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_trip_member"("p_trip_id" "uuid", "p_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."set_trip_owner"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_trip_owner"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_trip_owner"() TO "service_role";

GRANT ALL ON FUNCTION "public"."shares_trip_with_user"("p_other_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."shares_trip_with_user"("p_other_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."shares_trip_with_user"("p_other_user_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."Accommodations" TO "anon";
GRANT ALL ON TABLE "public"."Accommodations" TO "authenticated";
GRANT ALL ON TABLE "public"."Accommodations" TO "service_role";

GRANT ALL ON TABLE "public"."Connections" TO "anon";
GRANT ALL ON TABLE "public"."Connections" TO "authenticated";
GRANT ALL ON TABLE "public"."Connections" TO "service_role";

GRANT ALL ON TABLE "public"."Events" TO "anon";
GRANT ALL ON TABLE "public"."Events" TO "authenticated";
GRANT ALL ON TABLE "public"."Events" TO "service_role";

GRANT ALL ON TABLE "public"."Expense_Splits" TO "anon";
GRANT ALL ON TABLE "public"."Expense_Splits" TO "authenticated";
GRANT ALL ON TABLE "public"."Expense_Splits" TO "service_role";

GRANT ALL ON TABLE "public"."Expenses" TO "anon";
GRANT ALL ON TABLE "public"."Expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."Expenses" TO "service_role";

GRANT ALL ON TABLE "public"."Journals" TO "anon";
GRANT ALL ON TABLE "public"."Journals" TO "authenticated";
GRANT ALL ON TABLE "public"."Journals" TO "service_role";

GRANT ALL ON TABLE "public"."Messages" TO "anon";
GRANT ALL ON TABLE "public"."Messages" TO "authenticated";
GRANT ALL ON TABLE "public"."Messages" TO "service_role";

GRANT ALL ON TABLE "public"."Photos" TO "anon";
GRANT ALL ON TABLE "public"."Photos" TO "authenticated";
GRANT ALL ON TABLE "public"."Photos" TO "service_role";

GRANT ALL ON TABLE "public"."Trip_Destinations" TO "anon";
GRANT ALL ON TABLE "public"."Trip_Destinations" TO "authenticated";
GRANT ALL ON TABLE "public"."Trip_Destinations" TO "service_role";

GRANT ALL ON TABLE "public"."Trip_Members" TO "anon";
GRANT ALL ON TABLE "public"."Trip_Members" TO "authenticated";
GRANT ALL ON TABLE "public"."Trip_Members" TO "service_role";

GRANT ALL ON TABLE "public"."Trips" TO "anon";
GRANT ALL ON TABLE "public"."Trips" TO "authenticated";
GRANT ALL ON TABLE "public"."Trips" TO "service_role";

GRANT ALL ON TABLE "public"."Users" TO "anon";
GRANT ALL ON TABLE "public"."Users" TO "authenticated";
GRANT ALL ON TABLE "public"."Users" TO "service_role";

GRANT ALL ON TABLE "public"."cached_destinations" TO "anon";
GRANT ALL ON TABLE "public"."cached_destinations" TO "authenticated";
GRANT ALL ON TABLE "public"."cached_destinations" TO "service_role";

GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";

GRANT ALL ON TABLE "public"."event_votes" TO "anon";
GRANT ALL ON TABLE "public"."event_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."event_votes" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";


drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  create policy "Allow authenticated uploads 1k9thrw_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated, anon
with check ((bucket_id = 'trip-media'::text));
  create policy "Allow public uploads 132rkg_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated, anon
with check ((bucket_id = 'trip-documents'::text));
  create policy "Avatar images are public"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));
  create policy "Trip covers are public to view"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'trip-covers'::text));
  create policy "Users can delete their own avatar"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
  create policy "Users can delete their own trip covers"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'trip-covers'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
  create policy "Users can update their own avatar"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)))
with check (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
  create policy "Users can update their own trip covers"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'trip-covers'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)))
with check (((bucket_id = 'trip-covers'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
  create policy "Users can upload their own avatar"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
  create policy "Users can upload their own trip covers"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'trip-covers'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));

INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('trip-covers', 'trip-covers', true),
  ('trip-media', 'trip-media', true),
  ('trip-documents', 'trip-documents', true)
ON CONFLICT (id) DO NOTHING;