package main

import (
	"encoding/json"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"sort"
)

type Player struct {
	Name  string `json:"Name"`
	Score int    `json:"Score"`
	Time  string `json:"Time"`
}

var PlayersBoard []Player
var filename = "scoreboard.json"

func parseExecuteTemplate(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.ParseFiles("./index.html"))
	tmpl.Execute(w, nil)
}

func readJsonFile() []byte {
	_, err := os.Stat(filename)
	if os.IsNotExist(err) {
		fileName, err := os.Create(filename)
		if err != nil {
			log.Fatal(err)
		}
		fileName.Close()
	}

	content, err := ioutil.ReadFile(filename)
	if err != nil {
		log.Fatal(err)
	}
	return content
}

func writeDataToJson(data []byte) {
	err := ioutil.WriteFile(filename, data, 0644)
	if err != nil {
		log.Fatal(err)
	}
}

func sortData() {
	sort.SliceStable(PlayersBoard, func(i, j int) bool {
		return PlayersBoard[i].Score > PlayersBoard[j].Score
	})
}

func apiHandler(w http.ResponseWriter, r *http.Request) {
	var player Player
	reqBody, _ := ioutil.ReadAll(r.Body)
	json.Unmarshal(reqBody, &player)
	PlayersBoard = append(PlayersBoard, player)
}
func createNewPlayer(w http.ResponseWriter, r *http.Request) {

	content := readJsonFile()
	json.Unmarshal(content, &PlayersBoard)
	if r.Method == "GET" {
		sortData()
	}
	if r.Method == "POST" {
		apiHandler(w, r)
		sortData()
		pB, _ := json.Marshal(PlayersBoard)
		writeDataToJson(pB)
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Origin")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Accept", "application/json")
	json.NewEncoder(w).Encode(PlayersBoard)
}

// func calculate(w http.ResponseWriter, r *http.Request) {

// }

func main() {
	port := "8282"

	mux := http.NewServeMux()

	mux.Handle("/client/", http.StripPrefix("/client", http.FileServer(http.Dir("./client"))))
	mux.HandleFunc("/", parseExecuteTemplate)
	mux.HandleFunc("/score", createNewPlayer)
	log.Println("port is Listening:", port)

	http.ListenAndServe(":"+port, mux)
}
