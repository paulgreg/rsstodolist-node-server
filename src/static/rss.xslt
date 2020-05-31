<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output method="html"/>

    <xsl:template match="/rss/channel">
        <head>
            <title><xsl:value-of select="title" /></title>
        </head>
        <body>
            <link rel="stylesheet" type="text/css" href="./static/rss.css"/>
            <h1><xsl:value-of select="title" /></h1>
            <xsl:apply-templates select="link" />
            <xsl:apply-templates select="item" />
        </body>
    </xsl:template>

    <xsl:template match="item">
        <article>
            <h2><xsl:value-of select="title" /></h2>
            <xsl:apply-templates select="link" />
            <xsl:value-of select="description" />
        </article>
    </xsl:template>

    <xsl:template match="link">
        <a href="{.}" rel="nofollow"><xsl:value-of select="." /></a>
    </xsl:template>

    <xsl:template match="description">
        <p><xsl:value-of select="." /></p>
    </xsl:template>

</xsl:stylesheet>
