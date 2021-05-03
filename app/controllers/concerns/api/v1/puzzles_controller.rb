

module Api
    module V1
        class PuzzlesController < ApplicationController
            protect_from_forgery with: :null_session,
            if: Proc.new { |c| c.request.format =~ %r{application/json} }
      
            def index
                puzzles = Puzzle.all
                
                render json: PuzzleSerializer.new(puzzles).serializable_hash
            end

            def daily
                puzzle = Puzzle.puzzle_of_the_day
                render json: PuzzleSerializer.new(puzzle, include: [:puzzletype]).serializable_hash
            end


            def show
                puzzle = Puzzle.where(slug: params[:slug])
                
                render json: PuzzleSerializer.new(puzzle, include: [:puzzletype]).serializable_hash
            end


            def create
                puzzle = Puzzle.new(puzzle_params)

                if puzzle.save
                    render json: PuzzleSerializer.new(puzzle).serializable_hash
                else
                    render json: { error: puzzle.errors.messages}, status: 422
                end
            end

            def destory
                puzzle = Puzzle.find_by(slug: params[:slug])


                if puzzle.destory
                    head :no_content
                else
                    render json: { error: puzzle.errors.messages}, status: 422
                end
            end

            private

            def puzzle_params
                params.require(:puzzle).permit(:name, :author, :difficulty, :ratingsum, :numratings, :data, :puzzletype_id)
            end
        end
    end
end