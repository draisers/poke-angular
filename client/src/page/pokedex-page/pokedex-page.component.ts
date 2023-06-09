import { Component, OnInit } from '@angular/core';
import { Pokemon } from 'src/models/pokedex';
import { PokedexService } from 'src/service/pokedex.service';

@Component({
  selector: 'app-pokedex-page',
  templateUrl: './pokedex-page.component.html',
  styleUrls: ['./pokedex-page.component.css']
})
export class PokedexPageComponent implements OnInit {
  currentPage = 1;
  pokemons: Pokemon[] = [];
  totalPage: number = 0;

  constructor(private pokedexService: PokedexService) {}

  ngOnInit(): void {
    this.getPokemon();
  }

  getPokemon = () => {
    this.pokedexService.createData(this.currentPage).subscribe({
      next: ({ results, totalPage }) => {
        this.pokemons = results;
        this.totalPage = totalPage;
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  setCurrentPage = (page: number) => {
    this.currentPage = page;
    this.getPokemon();
  }
}
