insert into public.organizations (name, acronym, slug) values
  ('Association of Civil Engineering Students', 'ACES', 'association-of-civil-engineering-students'),
  ('Institute of Electronics Engineers of the Philippines', 'IECEP', 'institute-of-electronics-engineers-of-the-philippines'),
  ('Institute of Computer Engineers of the Philippines', 'ICpEP', 'institute-of-computer-engineers-of-the-philippines'),
  ('Institute of Integrated Electrical Engineers', 'IIEE', 'institute-of-integrated-electrical-engineers'),
  ('Junior Philippine Institute of Accountants', 'JPIA', 'junior-philippine-institute-of-accountants'),
  ('Junior Business Executives', 'JBE', 'junior-business-executives'),
  ('FEU Alabang League of Tourism Students', 'FALTS', 'feu-alabang-league-of-tourism-students'),
  ('Junior Philippine Computer Society', 'JPCS', 'junior-philippine-computer-society'),
  ('Association for Computing Machinery', 'ACM', 'association-for-computing-machinery'),
  ('Feuture Arts', 'Feuture Arts', 'feuture-arts'),
  ('Psynapse Society', 'Psynapse', 'psynapse-society'),
  ('Freshmen Society', 'Freshmen Society', 'freshmen-society'),
  ('Apex Tamaraws', 'Apex Tamaraws', 'apex-tamaraws'),
  ('Recreation and Athletics Club', 'RAC', 'recreation-and-athletics-club'),
  ('Feuture Acts', 'Feuture Acts', 'feuture-acts'),
  ('Every Nations Campus', 'ENC', 'every-nations-campus'),
  ('Tertiary Honor Society', 'THS', 'tertiary-honor-society')
on conflict (slug) do nothing;
