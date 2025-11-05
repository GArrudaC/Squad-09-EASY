--
-- PostgreSQL database dump
--

\restrict 34ITH12dd9YDQE3Bm8Wbqse6olUrhser1zdaHjyW11cmNTSPNU2gAtYfwgHjUoM

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-04 19:22:15

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
-- TOC entry 5067 (class 1262 OID 16387)
-- Name: chatbot_fiscal; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE chatbot_fiscal WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Portuguese_Brazil.1252';


ALTER DATABASE chatbot_fiscal OWNER TO postgres;

\unrestrict 34ITH12dd9YDQE3Bm8Wbqse6olUrhser1zdaHjyW11cmNTSPNU2gAtYfwgHjUoM
\connect chatbot_fiscal
\restrict 34ITH12dd9YDQE3Bm8Wbqse6olUrhser1zdaHjyW11cmNTSPNU2gAtYfwgHjUoM

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16401)
-- Name: atendentes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.atendentes (
    id_atendente integer NOT NULL,
    nome character varying(100) NOT NULL,
    email character varying(100),
    cargo character varying(50),
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.atendentes OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16400)
-- Name: atendentes_id_atendente_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.atendentes_id_atendente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.atendentes_id_atendente_seq OWNER TO postgres;

--
-- TOC entry 5068 (class 0 OID 0)
-- Dependencies: 221
-- Name: atendentes_id_atendente_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.atendentes_id_atendente_seq OWNED BY public.atendentes.id_atendente;


--
-- TOC entry 226 (class 1259 OID 16426)
-- Name: conversas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversas (
    id_conversa integer NOT NULL,
    id_usuario integer,
    id_atendente integer,
    status character varying(20) DEFAULT 'em_andamento'::character varying,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.conversas OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16425)
-- Name: conversas_id_conversa_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conversas_id_conversa_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversas_id_conversa_seq OWNER TO postgres;

--
-- TOC entry 5069 (class 0 OID 0)
-- Dependencies: 225
-- Name: conversas_id_conversa_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conversas_id_conversa_seq OWNED BY public.conversas.id_conversa;


--
-- TOC entry 224 (class 1259 OID 16413)
-- Name: faq; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faq (
    id_faq integer NOT NULL,
    pergunta character varying(255) NOT NULL,
    resposta text NOT NULL,
    categoria character varying(100),
    atualizado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.faq OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16412)
-- Name: faq_id_faq_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.faq_id_faq_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faq_id_faq_seq OWNER TO postgres;

--
-- TOC entry 5070 (class 0 OID 0)
-- Dependencies: 223
-- Name: faq_id_faq_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.faq_id_faq_seq OWNED BY public.faq.id_faq;


--
-- TOC entry 228 (class 1259 OID 16446)
-- Name: mensagens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mensagens (
    id_mensagem integer NOT NULL,
    id_conversa integer,
    remetente character varying(20),
    conteudo text NOT NULL,
    data_envio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT mensagens_remetente_check CHECK (((remetente)::text = ANY ((ARRAY['usuario'::character varying, 'chatbot'::character varying, 'atendente'::character varying])::text[])))
);


ALTER TABLE public.mensagens OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16445)
-- Name: mensagens_id_mensagem_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mensagens_id_mensagem_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mensagens_id_mensagem_seq OWNER TO postgres;

--
-- TOC entry 5071 (class 0 OID 0)
-- Dependencies: 227
-- Name: mensagens_id_mensagem_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mensagens_id_mensagem_seq OWNED BY public.mensagens.id_mensagem;


--
-- TOC entry 220 (class 1259 OID 16389)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    nome character varying(100) NOT NULL,
    email character varying(100),
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16388)
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_usuario_seq OWNER TO postgres;

--
-- TOC entry 5072 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- TOC entry 4878 (class 2604 OID 16404)
-- Name: atendentes id_atendente; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.atendentes ALTER COLUMN id_atendente SET DEFAULT nextval('public.atendentes_id_atendente_seq'::regclass);


--
-- TOC entry 4882 (class 2604 OID 16429)
-- Name: conversas id_conversa; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversas ALTER COLUMN id_conversa SET DEFAULT nextval('public.conversas_id_conversa_seq'::regclass);


--
-- TOC entry 4880 (class 2604 OID 16416)
-- Name: faq id_faq; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faq ALTER COLUMN id_faq SET DEFAULT nextval('public.faq_id_faq_seq'::regclass);


--
-- TOC entry 4885 (class 2604 OID 16449)
-- Name: mensagens id_mensagem; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensagens ALTER COLUMN id_mensagem SET DEFAULT nextval('public.mensagens_id_mensagem_seq'::regclass);


--
-- TOC entry 4876 (class 2604 OID 16392)
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- TOC entry 5055 (class 0 OID 16401)
-- Dependencies: 222
-- Data for Name: atendentes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.atendentes (id_atendente, nome, email, cargo, criado_em) FROM stdin;
1	Carlos Almeida	carlos@empresa.com	Suporte Fiscal	2025-11-03 11:24:18.891693
\.


--
-- TOC entry 5059 (class 0 OID 16426)
-- Dependencies: 226
-- Data for Name: conversas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversas (id_conversa, id_usuario, id_atendente, status, criado_em) FROM stdin;
1	1	\N	em_andamento	2025-11-03 11:24:18.891693
\.


--
-- TOC entry 5057 (class 0 OID 16413)
-- Dependencies: 224
-- Data for Name: faq; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faq (id_faq, pergunta, resposta, categoria, atualizado_em) FROM stdin;
1	Como emitir nota fiscal?	Acesse o portal da SEFAZ e siga o passo a passo.	Emissão	2025-11-03 11:24:18.891693
2	Qual o prazo para pagamento do imposto?	O prazo é até o dia 10 do mês seguinte.	Pagamentos	2025-11-03 11:24:18.891693
\.


--
-- TOC entry 5061 (class 0 OID 16446)
-- Dependencies: 228
-- Data for Name: mensagens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mensagens (id_mensagem, id_conversa, remetente, conteudo, data_envio) FROM stdin;
1	1	usuario	Como faço para emitir uma nota fiscal?	2025-11-03 11:24:18.891693
2	1	chatbot	Acesse o portal da SEFAZ e siga o passo a passo.	2025-11-03 11:24:18.891693
\.


--
-- TOC entry 5053 (class 0 OID 16389)
-- Dependencies: 220
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id_usuario, nome, email, criado_em) FROM stdin;
1	João Silva	joao@email.com	2025-11-03 11:24:18.891693
2	Maria Santos	maria@email.com	2025-11-03 11:24:18.891693
\.


--
-- TOC entry 5073 (class 0 OID 0)
-- Dependencies: 221
-- Name: atendentes_id_atendente_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.atendentes_id_atendente_seq', 1, true);


--
-- TOC entry 5074 (class 0 OID 0)
-- Dependencies: 225
-- Name: conversas_id_conversa_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conversas_id_conversa_seq', 1, true);


--
-- TOC entry 5075 (class 0 OID 0)
-- Dependencies: 223
-- Name: faq_id_faq_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faq_id_faq_seq', 2, true);


--
-- TOC entry 5076 (class 0 OID 0)
-- Dependencies: 227
-- Name: mensagens_id_mensagem_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mensagens_id_mensagem_seq', 2, true);


--
-- TOC entry 5077 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 2, true);


--
-- TOC entry 4893 (class 2606 OID 16411)
-- Name: atendentes atendentes_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.atendentes
    ADD CONSTRAINT atendentes_email_key UNIQUE (email);


--
-- TOC entry 4895 (class 2606 OID 16409)
-- Name: atendentes atendentes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.atendentes
    ADD CONSTRAINT atendentes_pkey PRIMARY KEY (id_atendente);


--
-- TOC entry 4899 (class 2606 OID 16434)
-- Name: conversas conversas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversas
    ADD CONSTRAINT conversas_pkey PRIMARY KEY (id_conversa);


--
-- TOC entry 4897 (class 2606 OID 16424)
-- Name: faq faq_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faq
    ADD CONSTRAINT faq_pkey PRIMARY KEY (id_faq);


--
-- TOC entry 4901 (class 2606 OID 16457)
-- Name: mensagens mensagens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensagens
    ADD CONSTRAINT mensagens_pkey PRIMARY KEY (id_mensagem);


--
-- TOC entry 4889 (class 2606 OID 16399)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 4891 (class 2606 OID 16397)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 4902 (class 2606 OID 16440)
-- Name: conversas conversas_id_atendente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversas
    ADD CONSTRAINT conversas_id_atendente_fkey FOREIGN KEY (id_atendente) REFERENCES public.atendentes(id_atendente);


--
-- TOC entry 4903 (class 2606 OID 16435)
-- Name: conversas conversas_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversas
    ADD CONSTRAINT conversas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- TOC entry 4904 (class 2606 OID 16458)
-- Name: mensagens mensagens_id_conversa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensagens
    ADD CONSTRAINT mensagens_id_conversa_fkey FOREIGN KEY (id_conversa) REFERENCES public.conversas(id_conversa);


-- Completed on 2025-11-04 19:22:16

--
-- PostgreSQL database dump complete
--

\unrestrict 34ITH12dd9YDQE3Bm8Wbqse6olUrhser1zdaHjyW11cmNTSPNU2gAtYfwgHjUoM

