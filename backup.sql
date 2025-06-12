--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: dayofweek; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.dayofweek AS ENUM (
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
    'domingo'
);


ALTER TYPE public.dayofweek OWNER TO postgres;

--
-- Name: goalstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.goalstatus AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public.goalstatus OWNER TO postgres;

--
-- Name: goaltype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.goaltype AS ENUM (
    'WEIGHT',
    'CALORIES',
    'WATER'
);


ALTER TYPE public.goaltype OWNER TO postgres;

--
-- Name: mealofday; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.mealofday AS ENUM (
    'breakfast',
    'lunch',
    'snack',
    'dinner'
);


ALTER TYPE public.mealofday OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: foods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.foods (
    food_name character varying NOT NULL,
    id integer NOT NULL,
    patient_id integer
);


ALTER TABLE public.foods OWNER TO postgres;

--
-- Name: foods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.foods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.foods_id_seq OWNER TO postgres;

--
-- Name: foods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.foods_id_seq OWNED BY public.foods.id;


--
-- Name: goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.goals (
    goal_type public.goaltype NOT NULL,
    target_weight double precision,
    target_calories integer,
    target_milliliters integer,
    start_date date NOT NULL,
    target_date date,
    status public.goalstatus NOT NULL,
    id integer NOT NULL,
    patient_id integer NOT NULL,
    professional_id integer NOT NULL,
    achieved_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.goals OWNER TO postgres;

--
-- Name: goals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.goals_id_seq OWNER TO postgres;

--
-- Name: goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.goals_id_seq OWNED BY public.goals.id;


--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredients (
    name character varying NOT NULL,
    category character varying NOT NULL,
    grams double precision NOT NULL,
    calories_kcal double precision NOT NULL,
    protein_g double precision NOT NULL,
    fat_g double precision NOT NULL,
    carbs_g double precision NOT NULL,
    iron_mg double precision,
    calcium_mg double precision,
    vitamin_c_mg double precision,
    id integer NOT NULL
);


ALTER TABLE public.ingredients OWNER TO postgres;

--
-- Name: ingredients_foods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredients_foods (
    id integer NOT NULL,
    ingredient_id integer NOT NULL,
    food_id integer NOT NULL,
    grams double precision NOT NULL
);


ALTER TABLE public.ingredients_foods OWNER TO postgres;

--
-- Name: ingredients_foods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ingredients_foods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ingredients_foods_id_seq OWNER TO postgres;

--
-- Name: ingredients_foods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ingredients_foods_id_seq OWNED BY public.ingredients_foods.id;


--
-- Name: ingredients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ingredients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ingredients_id_seq OWNER TO postgres;

--
-- Name: ingredients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ingredients_id_seq OWNED BY public.ingredients.id;


--
-- Name: meals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meals (
    meal_name character varying NOT NULL,
    grams double precision NOT NULL,
    meal_of_the_day character varying NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    id integer NOT NULL,
    food_id integer NOT NULL,
    patient_id integer NOT NULL,
    calories double precision NOT NULL
);


ALTER TABLE public.meals OWNER TO postgres;

--
-- Name: meals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meals_id_seq OWNER TO postgres;

--
-- Name: meals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meals_id_seq OWNED BY public.meals.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    message character varying NOT NULL,
    is_read boolean NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    email character varying NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    weight double precision,
    height double precision,
    birth_date date,
    gender character varying,
    id integer NOT NULL,
    password_hash character varying NOT NULL,
    professional_id integer
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_id_seq OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patients_id_seq OWNED BY public.patients.id;


--
-- Name: professionals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.professionals (
    email character varying NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    specialization character varying NOT NULL,
    id integer NOT NULL,
    uuid_code character varying NOT NULL,
    password_hash character varying NOT NULL
);


ALTER TABLE public.professionals OWNER TO postgres;

--
-- Name: professionals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.professionals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.professionals_id_seq OWNER TO postgres;

--
-- Name: professionals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.professionals_id_seq OWNED BY public.professionals.id;


--
-- Name: water_intake; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.water_intake (
    amount_ml integer NOT NULL,
    intake_time timestamp without time zone NOT NULL,
    notes character varying,
    id integer NOT NULL,
    patient_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.water_intake OWNER TO postgres;

--
-- Name: water_intake_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.water_intake_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.water_intake_id_seq OWNER TO postgres;

--
-- Name: water_intake_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.water_intake_id_seq OWNED BY public.water_intake.id;


--
-- Name: water_reminders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.water_reminders (
    is_enabled boolean NOT NULL,
    interval_minutes integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    custom_message character varying(200),
    id integer NOT NULL,
    patient_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.water_reminders OWNER TO postgres;

--
-- Name: water_reminders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.water_reminders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.water_reminders_id_seq OWNER TO postgres;

--
-- Name: water_reminders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.water_reminders_id_seq OWNED BY public.water_reminders.id;


--
-- Name: weekly_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weekly_notes (
    week_start_date date NOT NULL,
    notes character varying,
    id integer NOT NULL,
    patient_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.weekly_notes OWNER TO postgres;

--
-- Name: weekly_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.weekly_notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.weekly_notes_id_seq OWNER TO postgres;

--
-- Name: weekly_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.weekly_notes_id_seq OWNED BY public.weekly_notes.id;


--
-- Name: weeklydietmeals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weeklydietmeals (
    id integer NOT NULL,
    meal_name character varying NOT NULL,
    day_of_week public.dayofweek NOT NULL,
    meal_of_the_day public.mealofday NOT NULL,
    completed boolean NOT NULL,
    food_id integer NOT NULL,
    weekly_diet_id integer NOT NULL
);


ALTER TABLE public.weeklydietmeals OWNER TO postgres;

--
-- Name: weeklydietmeals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.weeklydietmeals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.weeklydietmeals_id_seq OWNER TO postgres;

--
-- Name: weeklydietmeals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.weeklydietmeals_id_seq OWNED BY public.weeklydietmeals.id;


--
-- Name: weeklydiets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weeklydiets (
    id integer NOT NULL,
    week_start_date date NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    patient_id integer NOT NULL,
    professional_id integer NOT NULL
);


ALTER TABLE public.weeklydiets OWNER TO postgres;

--
-- Name: weeklydiets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.weeklydiets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.weeklydiets_id_seq OWNER TO postgres;

--
-- Name: weeklydiets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.weeklydiets_id_seq OWNED BY public.weeklydiets.id;


--
-- Name: weight_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weight_logs (
    weight double precision NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    id integer NOT NULL,
    patient_id integer NOT NULL
);


ALTER TABLE public.weight_logs OWNER TO postgres;

--
-- Name: weight_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.weight_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.weight_logs_id_seq OWNER TO postgres;

--
-- Name: weight_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.weight_logs_id_seq OWNED BY public.weight_logs.id;


--
-- Name: foods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods ALTER COLUMN id SET DEFAULT nextval('public.foods_id_seq'::regclass);


--
-- Name: goals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goals ALTER COLUMN id SET DEFAULT nextval('public.goals_id_seq'::regclass);


--
-- Name: ingredients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients ALTER COLUMN id SET DEFAULT nextval('public.ingredients_id_seq'::regclass);


--
-- Name: ingredients_foods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients_foods ALTER COLUMN id SET DEFAULT nextval('public.ingredients_foods_id_seq'::regclass);


--
-- Name: meals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meals ALTER COLUMN id SET DEFAULT nextval('public.meals_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: patients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients ALTER COLUMN id SET DEFAULT nextval('public.patients_id_seq'::regclass);


--
-- Name: professionals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professionals ALTER COLUMN id SET DEFAULT nextval('public.professionals_id_seq'::regclass);


--
-- Name: water_intake id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.water_intake ALTER COLUMN id SET DEFAULT nextval('public.water_intake_id_seq'::regclass);


--
-- Name: water_reminders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.water_reminders ALTER COLUMN id SET DEFAULT nextval('public.water_reminders_id_seq'::regclass);


--
-- Name: weekly_notes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_notes ALTER COLUMN id SET DEFAULT nextval('public.weekly_notes_id_seq'::regclass);


--
-- Name: weeklydietmeals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weeklydietmeals ALTER COLUMN id SET DEFAULT nextval('public.weeklydietmeals_id_seq'::regclass);


--
-- Name: weeklydiets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weeklydiets ALTER COLUMN id SET DEFAULT nextval('public.weeklydiets_id_seq'::regclass);


--
-- Name: weight_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weight_logs ALTER COLUMN id SET DEFAULT nextval('public.weight_logs_id_seq'::regclass);


--
-- Data for Name: foods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.foods (food_name, id, patient_id) FROM stdin;
Ensalada César	1	\N
Milanesa de pollo	2	\N
Tortilla de papa	3	\N
Arroz con pollo	4	\N
Hamburguesa	5	\N
Pizza margarita	6	\N
Guiso de lentejas	7	\N
Sopa de verduras	8	\N
Omelette de huevo	9	\N
Pollo al horno	10	\N
Ensalada de frutas	11	\N
\.


--
-- Data for Name: goals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.goals (goal_type, target_weight, target_calories, target_milliliters, start_date, target_date, status, id, patient_id, professional_id, achieved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredients (name, category, grams, calories_kcal, protein_g, fat_g, carbs_g, iron_mg, calcium_mg, vitamin_c_mg, id) FROM stdin;
Pechuga de pollo	animal	100	165	31	3.6	0	1	15	0	1
Muslo de pollo	animal	100	177	24	8	0	1.3	11	0	2
Carne de vaca	animal	100	250	26	17	0	2.6	11	0	3
Carne molida magra	animal	100	215	26	12	0	2.5	18	0	4
Lomo de cerdo	animal	100	143	21	5	0	0.9	10	0	5
Costilla de cerdo	animal	100	291	20	24	0	1.1	18	0	6
Salmón	animal	100	208	20	13	0	0.5	9	0	7
Atún	animal	100	132	28	1	0	1	10	0	8
Huevo	animal	100	155	13	5	0.6	1.2	25	0	9
Zanahoria	verdura	100	41	0.9	0.2	10	0.3	33	5.9	10
Brócoli	verdura	100	34	2.8	0.4	7	0.7	47	89	11
Espinaca	verdura	100	23	2.9	0.4	3.6	2.7	99	28	12
Papa	verdura	100	77	2	0.1	17	0.8	12	19.7	13
Batata	verdura	100	86	1.6	0.1	20	0.6	30	2.4	14
Tomate	verdura	100	18	0.9	0.2	3.9	0.3	10	13.7	15
Cebolla	verdura	100	40	1.1	0.1	9.3	0.2	23	8.1	16
Morrón rojo	verdura	100	31	1	0.3	6	0.4	7	127	17
Ajo	verdura	100	149	6.4	0.5	33	1.7	181	31.2	18
Manzana	fruta	100	52	0.3	0.2	14	0.1	6	4.6	19
Banana	fruta	100	89	1.1	0.3	23	0.3	5	8.7	20
Naranja	fruta	100	47	0.9	0.1	12	0.1	40	53	21
Uva	fruta	100	69	0.7	0.2	18	0.4	10	10.8	22
Pera	fruta	100	57	0.4	0.1	15	0.2	9	4.3	23
Frutilla	fruta	100	32	0.7	0.3	7.7	0.4	16	58.8	24
Kiwi	fruta	100	61	1.1	0.5	15	0.3	34	92.7	25
Sandía	fruta	100	30	0.6	0.2	8	0.2	7	8.1	26
Tofu	proteína vegetal	100	76	8	4.8	1.9	1.6	350	0.1	27
Lentejas cocidas	proteína vegetal	100	116	9	0.4	20	3.3	19	1.5	28
Garbanzos cocidos	proteína vegetal	100	164	8.9	2.6	27.4	2.9	49	1.3	29
Porotos negros cocidos	proteína vegetal	100	132	8.9	0.5	23.7	2.1	27	0	30
Soja cocida	proteína vegetal	100	173	16.6	9	9.9	2.5	102	6	31
Seitán	proteína vegetal	100	121	21	2	4	1.2	14	0	32
\.


--
-- Data for Name: ingredients_foods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredients_foods (id, ingredient_id, food_id, grams) FROM stdin;
1	2	1	100
2	10	1	50
3	12	1	50
4	1	2	150
5	17	2	60
6	15	2	100
7	15	3	250
8	17	3	100
9	1	4	100
10	15	4	100
11	18	4	150
12	3	5	120
13	7	5	80
14	14	6	100
15	17	6	50
16	20	7	150
17	10	7	80
18	11	8	100
19	12	8	80
20	13	8	100
21	9	9	150
22	1	10	200
23	23	11	100
24	24	11	100
25	25	11	100
\.


--
-- Data for Name: meals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meals (meal_name, grams, meal_of_the_day, "timestamp", id, food_id, patient_id, calories) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, patient_id, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (email, first_name, last_name, weight, height, birth_date, gender, id, password_hash, professional_id) FROM stdin;
celesdbenedetto@gmail.com	Celes	Paciente	44	\N	\N	\N	1	$2b$12$v2p1BzHraUAz2u5rZuYj/.LJDU.Vxyn2Y9XLtcx048SzRMOgKud7O	\N
\.


--
-- Data for Name: professionals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.professionals (email, first_name, last_name, specialization, id, uuid_code, password_hash) FROM stdin;
\.


--
-- Data for Name: water_intake; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.water_intake (amount_ml, intake_time, notes, id, patient_id, created_at) FROM stdin;
250	2025-06-12 00:34:24.278		1	1	2025-06-12 00:34:24.304819
250	2025-06-12 00:34:25.045		2	1	2025-06-12 00:34:25.066352
\.


--
-- Data for Name: water_reminders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.water_reminders (is_enabled, interval_minutes, start_time, end_time, custom_message, id, patient_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: weekly_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weekly_notes (week_start_date, notes, id, patient_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: weeklydietmeals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weeklydietmeals (id, meal_name, day_of_week, meal_of_the_day, completed, food_id, weekly_diet_id) FROM stdin;
\.


--
-- Data for Name: weeklydiets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weeklydiets (id, week_start_date, created_at, updated_at, patient_id, professional_id) FROM stdin;
\.


--
-- Data for Name: weight_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weight_logs (weight, "timestamp", id, patient_id) FROM stdin;
42	2025-06-12 00:34:11.322893	1	1
43	2025-06-12 00:34:14.884574	2	1
44	2025-06-12 00:34:17.946882	3	1
\.


--
-- Name: foods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.foods_id_seq', 11, true);


--
-- Name: goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.goals_id_seq', 1, false);


--
-- Name: ingredients_foods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingredients_foods_id_seq', 25, true);


--
-- Name: ingredients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingredients_id_seq', 32, true);


--
-- Name: meals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meals_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: patients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patients_id_seq', 1, true);


--
-- Name: professionals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.professionals_id_seq', 1, false);


--
-- Name: water_intake_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.water_intake_id_seq', 2, true);


--
-- Name: water_reminders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.water_reminders_id_seq', 1, false);


--
-- Name: weekly_notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.weekly_notes_id_seq', 1, false);


--
-- Name: weeklydietmeals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.weeklydietmeals_id_seq', 1, false);


--
-- Name: weeklydiets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.weeklydiets_id_seq', 1, false);


--
-- Name: weight_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.weight_logs_id_seq', 3, true);


--
-- Name: foods foods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: ingredients_foods ingredients_foods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients_foods
    ADD CONSTRAINT ingredients_foods_pkey PRIMARY KEY (id);


--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (id);


--
-- Name: meals meals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT meals_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: professionals professionals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professionals
    ADD CONSTRAINT professionals_pkey PRIMARY KEY (id);


--
-- Name: water_intake water_intake_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.water_intake
    ADD CONSTRAINT water_intake_pkey PRIMARY KEY (id);


--
-- Name: water_reminders water_reminders_patient_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.water_reminders
    ADD CONSTRAINT water_reminders_patient_id_key UNIQUE (patient_id);


--
-- Name: water_reminders water_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.water_reminders
    ADD CONSTRAINT water_reminders_pkey PRIMARY KEY (id);


--
-- Name: weekly_notes weekly_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_notes
    ADD CONSTRAINT weekly_notes_pkey PRIMARY KEY (id);


--
-- Name: weeklydietmeals weeklydietmeals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weeklydietmeals
    ADD CONSTRAINT weeklydietmeals_pkey PRIMARY KEY (id);


--
-- Name: weeklydiets weeklydiets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weeklydiets
    ADD CONSTRAINT weeklydiets_pkey PRIMARY KEY (id);


--
-- Name: weight_logs weight_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weight_logs
    ADD CONSTRAINT weight_logs_pkey PRIMARY KEY (id);


--
-- Name: ix_professionals_uuid_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_professionals_uuid_code ON public.professionals USING btree (uuid_code);


--
-- Name: foods foods_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: goals goals_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: goals goals_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.professionals(id);


--
-- Name: ingredients_foods ingredients_foods_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients_foods
    ADD CONSTRAINT ingredients_foods_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id);


--
-- Name: ingredients_foods ingredients_foods_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients_foods
    ADD CONSTRAINT ingredients_foods_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id);


--
-- Name: meals meals_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT meals_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id);


--
-- Name: meals meals_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT meals_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: notifications notifications_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: patients patients_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.professionals(id);


--
-- Name: water_intake water_intake_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.water_intake
    ADD CONSTRAINT water_intake_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: water_reminders water_reminders_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.water_reminders
    ADD CONSTRAINT water_reminders_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: weekly_notes weekly_notes_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_notes
    ADD CONSTRAINT weekly_notes_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: weeklydietmeals weeklydietmeals_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weeklydietmeals
    ADD CONSTRAINT weeklydietmeals_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id);


--
-- Name: weeklydietmeals weeklydietmeals_weekly_diet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weeklydietmeals
    ADD CONSTRAINT weeklydietmeals_weekly_diet_id_fkey FOREIGN KEY (weekly_diet_id) REFERENCES public.weeklydiets(id);


--
-- Name: weeklydiets weeklydiets_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weeklydiets
    ADD CONSTRAINT weeklydiets_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: weeklydiets weeklydiets_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weeklydiets
    ADD CONSTRAINT weeklydiets_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.professionals(id);


--
-- Name: weight_logs weight_logs_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weight_logs
    ADD CONSTRAINT weight_logs_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- PostgreSQL database dump complete
--

