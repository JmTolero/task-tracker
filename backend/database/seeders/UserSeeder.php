<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
       User::create ([

        "name"=> "Admin User",
        "email"=> "admin@example.com",
        "password"=> Hash::make('password'),
        'role'=>'admin',
       ]);

       User::create ([

        "name"=> "Client User",
        "email"=> "client@example.com",
        "password"=> Hash::make('password'),
        'role'=>'client',
       ]);


    }
}
