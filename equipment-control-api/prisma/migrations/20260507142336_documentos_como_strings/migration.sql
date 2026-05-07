ALTER TABLE "Equipment"
  ALTER COLUMN "listaPecas" TYPE TEXT
  USING CASE
    WHEN "listaPecas" IS TRUE THEN 'Sim'
    WHEN "listaPecas" IS FALSE THEN ''
    ELSE NULL
  END;

ALTER TABLE "Equipment"
  ALTER COLUMN "sequenciaMontagem" TYPE TEXT
  USING CASE
    WHEN "sequenciaMontagem" IS TRUE THEN 'Sim'
    WHEN "sequenciaMontagem" IS FALSE THEN ''
    ELSE NULL
  END;

ALTER TABLE "Equipment"
  ALTER COLUMN "inspecaoMontagem" TYPE TEXT
  USING CASE
    WHEN "inspecaoMontagem" IS TRUE THEN 'Sim'
    WHEN "inspecaoMontagem" IS FALSE THEN ''
    ELSE NULL
  END;

ALTER TABLE "Equipment"
  ALTER COLUMN "historicoEquipamento" TYPE TEXT
  USING CASE
    WHEN "historicoEquipamento" IS TRUE THEN 'Sim'
    WHEN "historicoEquipamento" IS FALSE THEN ''
    ELSE NULL
  END;

ALTER TABLE "Equipment"
  ALTER COLUMN "procedimentoTesteInspecaoMontagem" TYPE TEXT
  USING CASE
    WHEN "procedimentoTesteInspecaoMontagem" IS TRUE THEN 'Sim'
    WHEN "procedimentoTesteInspecaoMontagem" IS FALSE THEN ''
    ELSE NULL
  END;
