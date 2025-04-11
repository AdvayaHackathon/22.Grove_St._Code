package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

const (
	PublicDir    string = "./public/"
	PostgresUser string = "appUser"
	PostgresPass string = "payanaAdvaya"
	PostgresDB   string = "mainPayana"
	PostgresHost string = "psql"
	PostgresPort string = "5432"
)

var db *sql.DB

func main() {
	gin.SetMode(gin.ReleaseMode)
	var err error
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		PostgresHost, PostgresPort, PostgresUser, PostgresPass, PostgresDB)
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		panic(err)
	}

	router := gin.Default()

	api := router.Group("/places")
	{
		api.GET("/:table", getPlaces)
		api.GET("/:table/:place_name/:lang", getPlaceDetails)
		api.POST("/:table", addPlace)
		api.PUT("/:table/:place_name", updatePlace)
		api.DELETE("/:table/:place_name", deletePlace)
	}

	router.Static("/public", PublicDir)

	err = router.SetTrustedProxies([]string{"127.0.0.1", "0.0.0.0"})
	if err != nil {
		panic(err)
	}

	router.Run(":62452")
	log.Println("Running in :62452")
}

func getPlaces(c *gin.Context) {
	table := c.Param("table")
	fields := c.Query("fields")

	query := ""
	if fields == "name" {
		query = fmt.Sprintf("SELECT place_name FROM %s", table)
	} else {
		query = fmt.Sprintf("SELECT place_name, kn, en FROM %s", table)
	}

	rows, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var places []map[string]interface{}
	cols, err := rows.Columns()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for rows.Next() {
		values := make([]interface{}, len(cols))
		scanArgs := make([]interface{}, len(cols))
		for i := range values {
			scanArgs[i] = &values[i]
		}

		if err := rows.Scan(scanArgs...); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		place := make(map[string]interface{})
		for i, col := range cols {
			var v interface{}
			val := values[i]
			if b, ok := val.([]byte); ok {
				v = string(b)
			} else {
				v = val
			}
			place[col] = v
		}
		places = append(places, place)
	}

	c.JSON(http.StatusOK, places)
}

func getPlaceDetails(c *gin.Context) {
	table := c.Param("table")
	placeName := c.Param("place_name")
	lang := c.Param("lang")

	if lang != "kn" && lang != "en" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid language parameter. Use 'kn' or 'en'."})
		return
	}

	query := fmt.Sprintf("SELECT %s FROM %s WHERE place_name = $1", lang, table)
	row := db.QueryRow(query, placeName)

	var details interface{}
	err := row.Scan(&details)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Place '%s' not found in table '%s'.", placeName, table)})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, details)
}

type Place struct {
	PlaceName string      `json:"place_name"`
	Kn        interface{} `json:"kn"`
	En        interface{} `json:"en"`
}

func addPlace(c *gin.Context) {
	table := c.Param("table")
	var newPlace Place
	if err := c.ShouldBindJSON(&newPlace); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := fmt.Sprintf("INSERT INTO %s (place_name, kn, en) VALUES ($1, $2, $3)", table)
	_, err := db.Exec(query, newPlace.PlaceName, newPlace.Kn, newPlace.En)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": fmt.Sprintf("Place '%s' added to table '%s'.", newPlace.PlaceName, table)})
}

func updatePlace(c *gin.Context) {
	table := c.Param("table")
	placeName := c.Param("place_name")
	var updatedPlace Place
	if err := c.ShouldBindJSON(&updatedPlace); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := fmt.Sprintf("UPDATE %s SET kn = $1, en = $2 WHERE place_name = $3", table)
	result, err := db.Exec(query, updatedPlace.Kn, updatedPlace.En, placeName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Place '%s' not found in table '%s'.", placeName, table)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("Place '%s' in table '%s' updated.", placeName, table)})
}

func deletePlace(c *gin.Context) {
	table := c.Param("table")
	placeName := c.Param("place_name")

	query := fmt.Sprintf("DELETE FROM %s WHERE place_name = $1", table)
	result, err := db.Exec(query, placeName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Place '%s' not found in table '%s'.", placeName, table)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("Place '%s' deleted from table '%s'.", placeName, table)})
}
