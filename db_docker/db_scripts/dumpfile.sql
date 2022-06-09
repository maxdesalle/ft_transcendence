--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2
-- Dumped by pg_dump version 14.2

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

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    room_id integer,
    user_id integer
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- Name: banned; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banned (
    user_id integer,
    banned_id integer,
    room_id integer,
    unban timestamp(3) with time zone,
    mute boolean NOT NULL,
    role integer
);


ALTER TABLE public.banned OWNER TO postgres;

--
-- Name: blocked; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blocked (
    user_id integer NOT NULL,
    blocked_id integer NOT NULL
);


ALTER TABLE public.blocked OWNER TO postgres;

--
-- Name: chat_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_user (
    id integer NOT NULL,
    name character varying(30) NOT NULL,
    status boolean
);


ALTER TABLE public.chat_user OWNER TO postgres;

--
-- Name: chat_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chat_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chat_user_id_seq OWNER TO postgres;

--
-- Name: chat_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chat_user_id_seq OWNED BY public.chat_user.id;


--
-- Name: message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.message (
    id integer NOT NULL,
    user_id integer,
    "timestamp" timestamp(3) with time zone NOT NULL,
    message text NOT NULL,
    room_id integer
);


ALTER TABLE public.message OWNER TO postgres;

--
-- Name: message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.message_id_seq OWNER TO postgres;

--
-- Name: message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.message_id_seq OWNED BY public.message.id;


--
-- Name: participants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participants (
    user_id integer,
    room_id integer
);


ALTER TABLE public.participants OWNER TO postgres;

--
-- Name: room; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room (
    id integer NOT NULL,
    name character varying(50),
    owner integer,
    private boolean DEFAULT true,
    password text,
    activity timestamp(3) with time zone
);


ALTER TABLE public.room OWNER TO postgres;

--
-- Name: room_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.room_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.room_id_seq OWNER TO postgres;

--
-- Name: room_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.room_id_seq OWNED BY public.room.id;


--
-- Name: chat_user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_user ALTER COLUMN id SET DEFAULT nextval('public.chat_user_id_seq'::regclass);


--
-- Name: message id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message ALTER COLUMN id SET DEFAULT nextval('public.message_id_seq'::regclass);


--
-- Name: room id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room ALTER COLUMN id SET DEFAULT nextval('public.room_id_seq'::regclass);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admins (room_id, user_id) FROM stdin;
3	1
\.


--
-- Data for Name: banned; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banned (user_id, banned_id, room_id, unban, mute, role) FROM stdin;
1	2	40	2022-05-13 21:12:13.833+02	f	2
1	5	40	2022-05-13 21:29:09.552+02	f	2
1	4	40	2022-05-13 21:29:11.687+02	f	2
\.


--
-- Data for Name: blocked; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blocked (user_id, blocked_id) FROM stdin;
3	4
3	1
1	2
\.


--
-- Data for Name: chat_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_user (id, name, status) FROM stdin;
2	mlefevre	t
3	mdesalle	t
4	dbanzizi	t
5	rcammaro	t
1	dszklarz	t
\.


--
-- Data for Name: message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.message (id, user_id, "timestamp", message, room_id) FROM stdin;
3	3	2022-05-01 11:04:22.401+02	message from mdesalle(3) to group room 3	3
5	2	2022-05-01 11:04:22.401+02	coucou	3
74	1	2022-05-11 14:56:42.952+02	msg for activity	18
91	1	2022-05-13 18:56:39.259+02	coucou	32
\.


--
-- Data for Name: participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.participants (user_id, room_id) FROM stdin;
1	31
3	31
1	32
4	32
1	40
2	40
3	40
2	3
3	3
4	3
5	3
1	18
2	18
1	19
5	19
\.


--
-- Data for Name: room; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.room (id, name, owner, private, password, activity) FROM stdin;
18	dszklarz-mlefevre	\N	t	\N	2022-05-11 14:57:58.42+02
19	dszklarz-rcammaro	\N	t	\N	2022-05-11 15:25:50.677+02
40	new_group	1	t	$2a$06$AGEOepyaCn9SwQdhgGCIlO/JVebFI1caH5KR6xGpy6TMa3MunV9iW	2022-05-13 19:10:06.874+02
26	test	1	t	$2a$06$bgKzODBq5mkVtW0OKdeJp.DuDE9n0MU0t0Zvltp9tKmyB1mcnOSOC	2022-05-12 10:37:41.948+02
3	group_chat	2	f	\N	2022-05-01 10:43:13.33+02
31	dszklarz-mdesalle	\N	t	\N	\N
32	dszklarz-dbanzizi	\N	t	\N	\N
\.


--
-- Name: chat_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chat_user_id_seq', 5, true);


--
-- Name: message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.message_id_seq', 91, true);


--
-- Name: room_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.room_id_seq', 40, true);


--
-- Name: chat_user chat_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_user
    ADD CONSTRAINT chat_user_pkey PRIMARY KEY (id);


--
-- Name: room pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room
    ADD CONSTRAINT pk PRIMARY KEY (id);


--
-- Name: blocked pk2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked
    ADD CONSTRAINT pk2 PRIMARY KEY (user_id, blocked_id);


--
-- Name: room unique_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room
    ADD CONSTRAINT unique_name UNIQUE (name);


--
-- Name: message fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT fk FOREIGN KEY (room_id) REFERENCES public.room(id);


--
-- Name: participants fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participants
    ADD CONSTRAINT fk FOREIGN KEY (room_id) REFERENCES public.room(id);


--
-- Name: blocked fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked
    ADD CONSTRAINT fk FOREIGN KEY (user_id) REFERENCES public.chat_user(id);


--
-- Name: admins fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT fk FOREIGN KEY (room_id) REFERENCES public.room(id);


--
-- Name: banned fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banned
    ADD CONSTRAINT fk FOREIGN KEY (user_id) REFERENCES public.chat_user(id);


--
-- Name: participants fk2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participants
    ADD CONSTRAINT fk2 FOREIGN KEY (user_id) REFERENCES public.chat_user(id);


--
-- Name: blocked fk2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked
    ADD CONSTRAINT fk2 FOREIGN KEY (blocked_id) REFERENCES public.chat_user(id);


--
-- Name: admins fk2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT fk2 FOREIGN KEY (user_id) REFERENCES public.chat_user(id);


--
-- Name: banned fk2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banned
    ADD CONSTRAINT fk2 FOREIGN KEY (banned_id) REFERENCES public.chat_user(id);


--
-- Name: banned fk3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banned
    ADD CONSTRAINT fk3 FOREIGN KEY (room_id) REFERENCES public.room(id);


--
-- Name: message user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.chat_user(id);


--
-- PostgreSQL database dump complete
--

