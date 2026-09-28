-- CreateTable
CREATE TABLE "CachedCondition" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionIndicator" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "indicatorCode" TEXT NOT NULL,
    "indicatorName" TEXT NOT NULL,
    "year" INTEGER,
    "value" DOUBLE PRECISION,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegionIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "summary" TEXT,
    "publishedAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SymptomLogEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SymptomLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CachedCondition_query_key" ON "CachedCondition"("query");

-- CreateIndex
CREATE UNIQUE INDEX "RegionIndicator_countryCode_indicatorCode_year_key" ON "RegionIndicator"("countryCode", "indicatorCode", "year");

-- CreateIndex
CREATE UNIQUE INDEX "NewsItem_link_key" ON "NewsItem"("link");
