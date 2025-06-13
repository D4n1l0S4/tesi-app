--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-06-13 17:08:59

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
-- TOC entry 226 (class 1259 OID 57656)
-- Name: caregiver_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.caregiver_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 57632)
-- Name: caregiver; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.caregiver (
    id bigint DEFAULT nextval('public.caregiver_id_seq'::regclass) NOT NULL,
    first_name character varying(250) NOT NULL,
    last_name character varying(250) NOT NULL,
    email character varying(250) NOT NULL,
    phone character varying(20) NOT NULL,
    address character varying(200) NOT NULL,
    date_of_birth date NOT NULL,
    fiscal_code character varying(16) NOT NULL,
    gender character varying(1) NOT NULL,
    CONSTRAINT caregiver_gender_check CHECK (((gender)::text = ANY ((ARRAY['M'::character varying, 'F'::character varying, 'A'::character varying])::text[])))
);


--
-- TOC entry 219 (class 1259 OID 24845)
-- Name: patient; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient (
    id bigint NOT NULL,
    first_name character varying(250) NOT NULL,
    last_name character varying(250) NOT NULL,
    date_of_birth date NOT NULL,
    email character varying(250),
    phone character varying(20),
    address character varying(200),
    gender character varying(1) NOT NULL,
    fiscal_code character varying(16) NOT NULL,
    CONSTRAINT patient_gender_check CHECK (((gender)::text = ANY ((ARRAY['M'::character varying, 'F'::character varying, 'A'::character varying])::text[])))
);


--
-- TOC entry 227 (class 1259 OID 57657)
-- Name: patient_caregiver_association_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.patient_caregiver_association_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 225 (class 1259 OID 57641)
-- Name: patient_caregiver_association; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_caregiver_association (
    id bigint DEFAULT nextval('public.patient_caregiver_association_id_seq'::regclass) NOT NULL,
    patient_id bigint NOT NULL,
    caregiver_id bigint NOT NULL,
    relationship character varying(100) NOT NULL
);


--
-- TOC entry 218 (class 1259 OID 24844)
-- Name: patient_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.patient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4908 (class 0 OID 0)
-- Dependencies: 218
-- Name: patient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.patient_id_seq OWNED BY public.patient.id;


--
-- TOC entry 217 (class 1259 OID 24779)
-- Name: patient_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.patient_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 223 (class 1259 OID 57558)
-- Name: pedigree; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedigree (
    id bigint NOT NULL,
    patient_id bigint NOT NULL,
    data jsonb NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    last_modified timestamp without time zone DEFAULT now() NOT NULL,
    last_modified_by bigint NOT NULL
);


--
-- TOC entry 222 (class 1259 OID 57557)
-- Name: pedigree_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pedigree_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4909 (class 0 OID 0)
-- Dependencies: 222
-- Name: pedigree_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pedigree_id_seq OWNED BY public.pedigree.id;


--
-- TOC entry 221 (class 1259 OID 32996)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    username character varying(250) NOT NULL,
    password character varying(250) NOT NULL,
    email character varying(250) NOT NULL,
    first_name character varying(250) NOT NULL,
    last_name character varying(250) NOT NULL,
    date_of_birth date,
    address character varying(200),
    phone character varying(20) NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 32995)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4910 (class 0 OID 0)
-- Dependencies: 220
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4716 (class 2604 OID 57658)
-- Name: patient id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient ALTER COLUMN id SET DEFAULT nextval('public.patient_id_seq'::regclass);


--
-- TOC entry 4718 (class 2604 OID 57561)
-- Name: pedigree id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedigree ALTER COLUMN id SET DEFAULT nextval('public.pedigree_id_seq'::regclass);


--
-- TOC entry 4717 (class 2604 OID 33012)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4899 (class 0 OID 57632)
-- Dependencies: 224
-- Data for Name: caregiver; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.caregiver (id, first_name, last_name, email, phone, address, date_of_birth, fiscal_code, gender) FROM stdin;
25	Patrizia	Violetta	patrizia.violetta@gmail.it	+39 7771010668	Via Abate Gimma, 67	1983-04-30	PTRVTT79D03A662U	F
5	Marco	Bianchi	marco.bianchi@example.com	+39 333 1234567	Via Roma 15, Milano	1975-05-15	BNCMRC75E15F205X	M
26	Giacinto	Facchetti	giacinto.facchetti@inter.com	+39 3804012015	Via Internazionale 1, Milano	1942-07-18	GIAFCC65I10P190S	M
23	Piero	Ausilio	piero.ausilio@inter.com	+39 3258945610	Via Internazionale 120, Milano	1972-06-28	SLAPRI72H28F205F	M
27	Claudio	Ranieri	claudio.ranieri@italia.it	+39 0908070605	Via Carbonara 22, Roma	1951-10-20	RNRCLD51R20H501F	M
21	Giuseppe	Marotta	giuseppe.marotta@inter.it	+39 6069096969	Via Internazionale 4, Milano	1957-03-25	MRTGPP57C25L682W	M
7	Paolo	gialli	paolo.gialli@example.com	+39 379 3456789	Corso Roma 1, milano	1985-01-15	GLLPLA80P60H501W	M
8	Gino	Paoli	gino.paoli@gmail.com	+39 8007006001	Via lame 1, Bari	1980-10-10	GNOPOL80P60H501W	M
9	Pino	Neri	pino.neri@gmail.com	+9090909090	Via Ciao 10, Bari	2002-10-10	PNONRI80P60H501W	M
10	Vito	Verdi	vito.verdi@gmail.com	+39 5006007008	Via da lì 1, Bari	1990-10-10	VITVRD80P60H501M	M
12	Mario	Bros	mario.bros@gmail.com	+39 6654489781	Via Parco 2 Giugno 107, Bari	1965-07-14	MRIBRS80P60H501W	M
13	Piero	Blu	piero.blu@gmail.com	+39 8005006664	Via Bari 10, Milano	1990-05-15	PIRVLO80P60H501W	M
11	Pippo	Bianchissimo	pippo.bianchi@gmail.com	+392002012029	Via Marina Nuova 350, Brindisi	1991-08-06	PPPBNC80P60H501W	M
14	Hansi	Flick	hansi.flick@barcelona.it	+90 8080707050	Via Vardrid 150, Varcellona	1965-02-24	HNSFLC80P60H501W	M
16	Simone	Inzaghi	simone.inzaghi@inter.com	+80 705040601230	Via Inter 4, Milano	1976-04-05	SMNNZG76P60H501Z	M
17	Luca	Djokovic	luca.djoko@tennis.com	+70 4010205080	Via Paella 40, Barcelona	1985-09-30	LLLLLL22Q11Q222P	M
18	Gino	Marino	gino.marino@pescheria.com	+39 60105040704	Via Barracuda 100, San Giorgio	1955-08-23	WWWWWW70W80W999W	M
19	Pasquale	Di Natale	paky.dinatale@football.com	+39 555666789	Via Football 7, Roma	1989-03-05	PQLDNT01Q88Q808Q	M
6	Laura	Verdi	laura.verdi@example.com	+39 339 9876543	Corso Vittorio 25, Roma	1980-09-20	VRDLRA80P60H501W	F
15	Maria	Dico	maria.dico@gmail.com	+90 708050906045	Via Lame 7/b, Gallipoli	1978-03-24	MRIDCI80P60H501F	F
20	Nino	Celestino	nino.celestino@example.com	+39 379 3458888	Corso Venezia 10, Milano	1988-03-24	NINCLS80P60H501W	M
22	Luca	Yellow	luca.yellow@gmail.it	+39 0001119998	Via Spezia 1, Roma	1985-08-07	PPPMMM80L88K405Q	M
24	Filomena	Nerino	filomena.nerino@gmail.com	+390 1221231248	Via delle Regioni 206, Bari	1987-10-09	FLMNRS80P60H501L	F
\.


--
-- TOC entry 4894 (class 0 OID 24845)
-- Dependencies: 219
-- Data for Name: patient; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patient (id, first_name, last_name, date_of_birth, email, phone, address, gender, fiscal_code) FROM stdin;
47	Federico	Dimarco	1997-11-10	federico.dimarco@inter.it	+39 9090707011	Via Roma 9, Milano	M	DMRFRC97S10F205D
36	Nicola	Zalewski	2002-01-23	nicola.zalewski@inter.it	+39 2225556660	Via Orfeo Mazzitelli 115, Bari	M	ZLWNCL02A23F205R
17	Luis	Suarez	1987-01-24	luis.suarez.barcelone@hotmail.it	+393602145897	Via MordoTutti 22, Uruguay	M	SRZLSU87A24H501X
19	Matteoo	Darmian	1993-08-03	m.darmian@fakeemail.com	+393477770011	Via Giuseppe Meazza 12, Milano	M	DRMMTT93M03F205D
18	Lionel	Messi	1987-06-24	lionel.messi@barcelona.it	3934779856321	Via Miami Street 10, USA	M	MSSLNL87H24F205L
27	Daniele	De Rossi	1983-07-24	daniele.derossi@roma.it	+39 9996667770	Via del Capitano 8, Roma	M	DRSDNL83L24H501X
3	Marcus	Thuram	1997-08-06	marcus.thuram@exampl.com	+391459786320	Via Meazza 55, Milano	M	THRMCS97M06F205S
7	Paolo	Maldini	1968-06-26	paolo.maldini@fakemailL.com	+393489988776	Viale San Siro 3, Milano	M	MLDPLA68H26F205F
1	Danilo	Santo	2001-10-15	danilo.santo@uniba.it	+39 12345678910	Via Principe Amedeo 10, Bari	M	SNTDNL01R15L425C
48	Claudio	Romito	2002-02-22	claudio.romito@gmail.com	+39 9009008008	Via Valenzano 104, Capurso	M	RMTCLD02B22B716J
26	Lamine	Yamal	2007-07-13	lamine.yamal@barcelona.it	123458796	Via Playa, Barcelona	M	YMLLMN07L13L219K
4	Federico	Chiesa	1997-10-25	federico.chiesa@liverpool.com	+393495551234	Viale LondonPark 33, Londra	M	CHSFRC97R25D612K
43	Henrikh	Mkhitaryan	1989-01-21	henrik.mkhitaryan@inter.it	+39 1122334455	Via Internazionale 100, Milano	M	MKHHRK89A21F205U
50	Yann 	Bisseck	2000-11-29	yann.bisseck@inter.it	+39 111222333444	Via Internazionale 100, Milano	M	BSSYNN00S29F205Q
29	Lautaro	Martinez	1997-08-22	lautaro.martinez@inter.it	+396981024578	Via delle Resistenza 22, Milano	M	MRTLTR97M22F205L
58	Marcelo	Brozovic	1992-11-16	marcelo.brozovic@inter.it	+33 5522001144	Via Al Hilal 40, Milano	M	BRZMCL92S16F205M
55	Benjamin	Pavard	1996-03-28	benjamin.pavard@inter.it	+39 4764774780	Via Bari 4, Milano	M	PVRBJM96C28A662P
6	Marco	Verratti	1992-11-05	marco.verratti@paris.com	+393407771122	Via Paris Saint-Germain 7, Parigi	M	VRRMRC92S05F205Y
16	Carlos	Augusto	1993-05-06	carlos.augusto@inter.it	+39 6547891235000	Via meazza, Milano	M	GSTCLS93E06F205M
45	Wayne	Rooney	1985-10-24	wayne.rooney@fakeemail.com	+99 3403503609	Viale Cambridge 10, Londra	M	RNYWYN85R24F205Q
39	Sergio	Ramos	1986-03-30	sergio.ramos@RealMadrid.com	+60 5558887771	Via bernabeu 15, Madrid	M	RMSSRG86C30A662U
31	Diego	Milito	1979-06-12	diego.milito@inter.it	+39 8888888880	Via della Repubblica, Milano	M	MLTDGI79H12F205L
32	Nico	Williams	2002-07-12	nico.williams@athleticbilbao.it	+35 1112223334	Via Nueva Espana, Bilbao	M	WLLNCI02L12F205V
5	Nicolò	Barella	1997-02-07	nicolo.barella@inter.com	+393488899900	Via Cagliari 22, Milano	M	BRLNCL97B07F205O
41	Denzel	Dumfires	1996-04-18	denzel.dumfries@inter.it	+39 8887774441	Via Internazionale 93, Milano	M	DNZDFR96D18F205X
42	Alessandro	Bastoni	1999-04-13	alessandro.bastoni@gmail.it	+39 0009990001	Via Internazionale 1, Milano	M	BSTLSN99D13F205G
40	Kylian	Mbappé	1998-12-20	kylian.mbappe@RealMadrid.com	+80 5558889990	Via Bernabeu 9, Madrid	M	MBPKLN98T20F205O
44	Francesca	Verdi	1954-04-18	francesca.verdi@gmail.com	+39 8887779994	Via Borgo Nuovo 117, Roma	F	VRDFNC54D58G273E
38	Francesco	Acerbi	1988-02-10	francesco.acerbi@inter.com	+39 909080801	Viale Internazionale 15, Milano	M	CRBFNC88B10F205X
60	Francesco Pio	Esposito	2005-06-28	francesco_pio.esposito@inter.it	+39 0050060070	Via Veneto 7, Milano	M	FNCSPT70E88Q145R
30	Javier	Zanetti	1973-08-10	javier.zanetti@internazionale.it	+39 5974120369	Via Internazionale 90, Milano	M	ZNTJVR73M10F205T
53	Neymar	Junior	1992-02-05	neymar.jr@barcelona.it	+90 0000000000	Viale Sao Paulo, Brazil	M	JNRNMR80A01F205D
54	Simone	Inzaghi	1976-04-05	simone.inzaghi@inter.it	+39 8006009697	Via Internazionale 1, Milano	M	NZGSMN76D05G535Q
46	Joshua	Zirkzee	2001-05-22	joshua.zirkzee@inter.it	+90 8887775551	Viale Vanoni 130, Bari	M	ZRKJSH01E22F205H
8	Andrea	Pirlo	1979-05-19	andrea.pirla@fakeemail.com	+393456789012	Via Regista 21, Brescia	M	PRLNDR79E19L219A
\.


--
-- TOC entry 4900 (class 0 OID 57641)
-- Dependencies: 225
-- Data for Name: patient_caregiver_association; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patient_caregiver_association (id, patient_id, caregiver_id, relationship) FROM stdin;
5	8	6	Cugina
6	3	11	altro
8	3	13	amico
2	16	6	Figlia
9	26	14	Familiare
10	48	15	Familiare
12	26	16	familiare
13	4	17	familiare
15	50	17	amico
16	50	19	Familiare
17	54	21	familiare
18	46	22	familiare
19	46	17	amico
21	47	23	Amico/a
22	55	23	Amico/a
23	55	24	Fratello/Sorella
24	58	16	familiare
25	58	25	Amico/a
26	6	16	familiare
3	16	5	Fratello/Sorella
28	53	26	amico
27	53	23	Familiare
30	60	27	amico
29	60	21	Familiare
31	6	14	altro
32	8	23	familiare
\.


--
-- TOC entry 4898 (class 0 OID 57558)
-- Dependencies: 223
-- Data for Name: pedigree; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pedigree (id, patient_id, data, created_by, created_at, last_modified, last_modified_by) FROM stdin;
21	18	[{"sex": "M", "name": "FjVS", "top_level": true, "display_name": " "}, {"sex": "F", "name": "JWOP", "top_level": true}, {"sex": "M", "name": "YHfN", "top_level": true}, {"sex": "F", "name": "aTqY", "top_level": true}, {"age": 37, "sex": "M", "yob": 1987, "name": "LionelMessi18", "father": "FjVS", "mother": "JWOP", "proband": true, "display_name": "Lionel", "diabetes_diagnosis_age": "1"}, {"sex": "F", "name": "iSkV", "father": "YHfN", "mother": "aTqY", "display_name": "Antonella"}, {"sex": "M", "name": "VEtz", "father": "LionelMessi18", "mother": "iSkV", "display_name": "Matteo"}, {"sex": "M", "name": "wHYO", "father": "LionelMessi18", "mother": "iSkV", "display_name": "Ciro"}, {"sex": "M", "name": "igtg", "father": "LionelMessi18", "mother": "iSkV", "display_name": "Thiago"}]	2	2025-06-06 11:19:44.443764	2025-06-10 16:38:16.198325	2
5	47	[{"age": 2, "sex": "M", "yob": 2023, "name": "EboI", "father": "FedericoDimarco47", "mother": "SKTP", "display_name": "Diego"}, {"age": 27, "sex": "M", "yob": 1997, "name": "FedericoDimarco47", "father": "uOKf", "mother": "INRf", "proband": true, "display_name": "Federico Dimarco"}, {"age": 54, "sex": "F", "yob": 1976, "name": "INRf", "top_level": true, "display_name": "Arianna"}, {"sex": "M", "name": "JVTI", "father": "uOKf", "mother": "INRf", "display_name": "Filippo"}, {"age": 6, "sex": "F", "yob": 2019, "name": "nYZB", "father": "FedericoDimarco47", "mother": "SKTP", "display_name": "Silvia"}, {"age": 29, "sex": "F", "yob": 1996, "name": "rEWp", "father": "uOKf", "mother": "INRf", "display_name": "Simona", "diabetes_diagnosis_age": "1"}, {"age": 26, "sex": "F", "yob": 1999, "name": "SKTP", "father": "waOp", "mother": "aJpr", "display_name": "Gaia", "diabetes_diagnosis_age": 9}, {"age": 31, "sex": "M", "yob": 1994, "name": "XpEi", "father": "waOp", "mother": "aJpr", "display_name": "Angelo"}, {"sex": "F", "name": "fRrA", "father": "waOp", "hidden": true, "mother": "aJpr", "noparents": true}, {"age": 10, "sex": "M", "yob": 2015, "name": "mVns", "father": "XpEi", "mother": "fRrA", "display_name": "John"}, {"age": 55, "sex": "M", "yob": 1975, "name": "uOKf", "top_level": true, "display_name": "Paolo"}, {"sex": "M", "name": "waOp", "top_level": true, "display_name": "Lucia"}, {"sex": "F", "name": "aJpr", "top_level": true, "display_name": "Emanuele"}]	1	2025-05-29 16:28:07.204408	2025-06-13 15:31:07.159281	2
26	7	[{"age": 76, "sex": "M", "yob": 1949, "name": "qAnT", "top_level": true, "display_name": "Domenico"}, {"age": 71, "sex": "F", "yob": 1954, "name": "vySJ", "top_level": true, "display_name": "Donata"}, {"age": 60, "sex": "M", "yob": 1965, "name": "khVN", "father": "qAnT", "mother": "vySJ", "noparents": true, "display_name": "Paride"}, {"age": 57, "sex": "M", "yob": 1968, "name": "PaoloMaldini7", "father": "qAnT", "mother": "vySJ", "proband": true, "display_name": "Paolo"}, {"sex": "M", "name": "tDeX", "father": "qAnT", "hidden": true, "mother": "vySJ", "noparents": true}, {"age": 56, "sex": "F", "yob": 1969, "name": "GRje", "father": "qAnT", "mother": "vySJ", "display_name": "Arianna"}, {"age": 48, "sex": "F", "yob": 1977, "name": "mcqw", "father": "qAnT", "mother": "vySJ", "display_name": "Rina"}, {"age": 22, "sex": "F", "yob": 2003, "name": "TtIy", "father": "tDeX", "mother": "mcqw", "display_name": "Maria"}, {"age": 24, "sex": "M", "yob": 2001, "name": "scpy", "father": "tDeX", "mother": "mcqw", "display_name": "Filippo"}, {"age": 35, "sex": "F", "yob": 1990, "name": "wlef", "father": "khVN", "mother": "GRje", "display_name": "Simona"}, {"age": 30, "sex": "F", "yob": 1995, "name": "UPlF", "father": "khVN", "mother": "GRje", "display_name": "Micaela"}, {"sex": "M", "name": "EwtQ", "father": "qAnT", "hidden": true, "mother": "vySJ", "noparents": true}, {"age": 45, "sex": "F", "yob": 1980, "name": "tiai", "father": "qAnT", "mother": "vySJ", "status": "0", "display_name": "Lucrezia"}, {"age": 56, "sex": "F", "yob": 1969, "name": "Oftn", "father": "qAnT", "mother": "vySJ", "display_name": "Noemi"}, {"age": 28, "sex": "F", "yob": 1997, "name": "RhHl", "father": "EwtQ", "mother": "Oftn", "display_name": "Anna"}, {"sex": "M", "name": "OFhU", "father": "qAnT", "hidden": true, "mother": "vySJ", "noparents": true}, {"sex": "M", "name": "Qvia", "father": "qAnT", "hidden": true, "mother": "vySJ", "noparents": true}, {"age": 48, "sex": "F", "yob": 1977, "name": "rjVb", "father": "qAnT", "mother": "vySJ", "display_name": "Ludovica"}, {"age": 26, "sex": "M", "yob": 1999, "name": "JaVO", "father": "OFhU", "mother": "rjVb", "display_name": "Nicola"}, {"age": 23, "sex": "M", "yob": 2002, "name": "Kkgt", "father": "OFhU", "mother": "rjVb", "display_name": "Alessandro"}, {"age": 46, "sex": "F", "yob": 1979, "name": "mKPi", "father": "qAnT", "mother": "vySJ", "display_name": "Pasquina"}, {"age": 8, "sex": "F", "yob": 2017, "name": "NvuU", "father": "Qvia", "mother": "mKPi", "display_name": "Ambra"}, {"age": 10, "sex": "F", "yob": 2015, "name": "gAQP", "father": "Qvia", "mother": "mKPi", "display_name": "Sissi"}, {"age": 50, "sex": "M", "yob": 1975, "name": "OeXS", "father": "qAnT", "mother": "vySJ", "display_name": "Antonio"}, {"age": 14, "sex": "M", "yob": 2011, "name": "dhsF", "father": "OeXS", "mother": "briL", "display_name": "Giovanni"}, {"sex": "F", "name": "briL", "father": "qAnT", "hidden": true, "mother": "vySJ", "noparents": true}, {"age": 45, "sex": "M", "yob": 1980, "name": "rHyY", "father": "qAnT", "mother": "vySJ", "display_name": "Vincenzo"}, {"age": 26, "sex": "F", "yob": 1999, "name": "pAgo", "father": "rHyY", "mother": "UkDv", "display_name": "Giancarlo"}, {"age": 18, "sex": "M", "yob": 2007, "name": "Hxru", "father": "rHyY", "mother": "UkDv", "display_name": "Silvia"}, {"sex": "F", "name": "UkDv", "father": "qAnT", "hidden": true, "mother": "vySJ", "noparents": true}, {"age": 25, "sex": "M", "yob": 2000, "name": "jdOG", "father": "PaoloMaldini7", "mother": "DRhe", "display_name": "Daniel"}, {"age": 27, "sex": "F", "yob": 1998, "name": "eFws", "father": "PaoloMaldini7", "mother": "DRhe", "display_name": "Cristina"}, {"sex": "F", "name": "DRhe", "father": "qAnT", "hidden": true, "mother": "vySJ", "noparents": true}]	2	2025-06-11 09:40:11.348831	2025-06-13 15:25:24.131848	2
\.


--
-- TOC entry 4896 (class 0 OID 32996)
-- Dependencies: 221
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, email, first_name, last_name, date_of_birth, address, phone) FROM stdin;
13	SmokyQuill01	$2a$10$9CcB3MlYm9uSqeWKByi1oOklCwxaqsMoLS3g6W6ljwMjr20h/INeC	smokyR6Siege@gmail.com	Smoky	Quill	2001-10-15	Viale Aldo Moro 22, Bari	+39 3001132284
1	d4n1lo_01	$2a$10$tY15Mq/uz61YaXhcugbeMOTWfEYR.SqZFkYquUn6gg6dKiZycStay	danilo@ciao.it	Danilo	Santo	2001-10-15	Via Roma, Milano	3334445550
2	l3om3ss1	$2a$10$ztGuqcPbivLDn/zwY.jXGOpg10MaTqyJKINSfA2eInjWD301VR6li	lionel@messi.it	Lionel	Messi	\N		1234567890
3	devil01	$2a$10$hIqdXS5zttGLHiH.lSEf2OocdOB1T/BthTp8YiPRFoUmRkZrpvFIG	devil01@qwerty.it	Mario	Rossi	1997-01-01		1234567890
4	El Toro Martinez	$2a$10$5.72AevC6Z.No6dvGoLYqezt7lUKZjxzfcDkxj..mxYumx8ZZq3kO	lautaro@martinez.it	Lautaro	Martinez	1996-06-10	Via San Siro, Milano	1098765432
5	Tikus	$2a$10$VwT3gbW5qgqmIc3Jn.ZOIet0/QHb4f6RBJyKsVSOYoGHPH1jxi6/m	marcus@thuram.it	Marcus	Thuram	1995-09-10	Via Meazza, Milano	1111444488
6	cris7	$2a$10$vFFTUd/9sDcgaiYIlp9E3eYh8NtRdwe35XLgnwoO0E9pXyrUz/l1C	cristiano@ronaldo.com	Cristiano	Ronaldo	1987-05-10	Via Lama, Portogallo	1234567810
8	WhiteShadow	$2a$10$JFPfeK4S6BY.LiEncYeJt.AyDNqdtAYEZTh80JmIjurrNmfkGn9EO	fakeemail@libero.it	Chris	Viola	1988-05-22	Via da Qui, Napoli	3697219834
9	GalloBelotti	$2a$10$wTFlBxeQDFT/QD2gsZdz9..ZCr/WI1WW4aeU07QMlBfsTOlrtb7ZO	fakeGalloBelotti@libero.cm	Gallo	Belotti	1996-03-10	Via da torino, Ravenna	+39-123456
10	ita-TATA	$2a$10$Ko3qSGt4YB8xSOtM.gTicep/zDcQGqxC3HyyjeOCFJuGDxyrOVkU.	tata@gmail.com	Antonio	Tata	1995-01-01	Corso Alcide de Gasperi, Modena	1236985691
11	ITA-Roxas_fn	$2a$10$vwmNaOmQccGOT93lV7VurOhPvRZD/1C2Q0hFrpgva/efUup.3GKga	rosario.fn@gmail.com	Rosario	Fortnite	1999-05-26	Viale Messina, Catania	+39-3602222221
12	pippokill	$2a$10$Z3r.6g2XKuShkAGLxQli1e/o7KJ/06/lMQw4qgMc75CpyJ16.Rx7O	pippokill@gmail.it	Pippo	Kill	1987-04-14	\N	0001117770
17	peppe_rossi	$2a$10$BnzuSq7Lt40eOZvw62OnNeaZrsAC5LkwOSTBaP73Pc5BCaMccCB..	giuseppe.rossi@gmail.com	Giuseppe	Rossi	1996-01-26	Via Paolo Benedetto 8, Firenze	+39 1112223330
18	DrHouse	$2a$10$/eQvt0FUPp8McuMEX6LMFu4m2rvUJn7iEwssuliqp6Xdl5KaEB4p6	ciao@hotmail.it	James	Laurie	1959-06-11	Via Rossani 14, Bari	+90 8005004008
19	ClaudioR_46	$2a$10$19LJFX7PphHK1cj45hAZQeh98HC.y4CcW1YuWUaAWu3/.SVjsjMhu	claudio@gmail.com	Claudio	Romix	2002-02-21	Viale Verde 21, Bari	+39 9998887775
20	user	$2a$10$/6Rhp8QAA5o75Vaypx6PKe63u8YoS2Fpo4NKrdkRlcf5fjkYMgfVW	admin@null.it	ADMIN	ADMIN	\N	\N	0000000000
\.


--
-- TOC entry 4911 (class 0 OID 0)
-- Dependencies: 226
-- Name: caregiver_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.caregiver_id_seq', 27, true);


--
-- TOC entry 4912 (class 0 OID 0)
-- Dependencies: 227
-- Name: patient_caregiver_association_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.patient_caregiver_association_id_seq', 32, true);


--
-- TOC entry 4913 (class 0 OID 0)
-- Dependencies: 218
-- Name: patient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.patient_id_seq', 60, true);


--
-- TOC entry 4914 (class 0 OID 0)
-- Dependencies: 217
-- Name: patient_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.patient_seq', 451, true);


--
-- TOC entry 4915 (class 0 OID 0)
-- Dependencies: 222
-- Name: pedigree_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pedigree_id_seq', 26, true);


--
-- TOC entry 4916 (class 0 OID 0)
-- Dependencies: 220
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 21, true);


-- Completed on 2025-06-13 17:09:00

--
-- PostgreSQL database dump complete
--

