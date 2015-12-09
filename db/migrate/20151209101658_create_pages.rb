class CreatePages < ActiveRecord::Migration
  def change
    create_table :pages do |t|
      t.string :title, null: false
      t.text :body
      t.integer :type, default: 1
      t.string :background

      t.timestamps null: false
    end
  end
end
