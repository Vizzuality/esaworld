# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160912145821) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "case_studies", force: :cascade do |t|
    t.string   "title",                                    null: false
    t.text     "description"
    t.integer  "template",                 default: 1
    t.boolean  "published",                default: false
    t.datetime "created_at",                               null: false
    t.datetime "updated_at",                               null: false
    t.string   "cover_image_file_name"
    t.string   "cover_image_content_type"
    t.integer  "cover_image_file_size"
    t.datetime "cover_image_updated_at"
    t.decimal  "lat"
    t.decimal  "lng"
    t.integer  "organization_id"
    t.string   "slug"
  end

  create_table "charts", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "charts_pages", force: :cascade do |t|
    t.integer "chart_id"
    t.integer "page_id"
  end

  add_index "charts_pages", ["chart_id"], name: "index_charts_pages_on_chart_id", using: :btree
  add_index "charts_pages", ["page_id"], name: "index_charts_pages_on_page_id", using: :btree

  create_table "contact_forms", force: :cascade do |t|
    t.string   "name",       null: false
    t.string   "email",      null: false
    t.text     "content",    null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "contacts", force: :cascade do |t|
    t.text     "body",              null: false
    t.integer  "case_study_id",     null: false
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
    t.string   "logo_file_name"
    t.string   "logo_content_type"
    t.integer  "logo_file_size"
    t.datetime "logo_updated_at"
    t.string   "website"
  end

  add_index "contacts", ["case_study_id"], name: "index_contacts_on_case_study_id", using: :btree

  create_table "data_layers", force: :cascade do |t|
    t.string   "table_name"
    t.string   "import_status",          default: "pending"
    t.integer  "page_id",                                    null: false
    t.datetime "created_at",                                 null: false
    t.datetime "updated_at",                                 null: false
    t.integer  "year"
    t.string   "layer_column"
    t.string   "layer_column_alias"
    t.text     "custom_columns_colors"
    t.string   "shapefile_file_name"
    t.string   "shapefile_content_type"
    t.integer  "shapefile_file_size"
    t.datetime "shapefile_updated_at"
    t.string   "raster_type"
    t.string   "raster_categories"
    t.text     "raster_color_input"
    t.boolean  "is_ready"
    t.integer  "import_attempt",         default: 0
  end

  add_index "data_layers", ["page_id"], name: "index_data_layers_on_page_id", using: :btree

  create_table "interest_points", force: :cascade do |t|
    t.string   "name",                                  null: false
    t.decimal  "lat",         precision: 15, scale: 10, null: false
    t.decimal  "lng",         precision: 15, scale: 10, null: false
    t.float    "radius"
    t.integer  "page_id",                               null: false
    t.datetime "created_at",                            null: false
    t.datetime "updated_at",                            null: false
    t.string   "description"
  end

  add_index "interest_points", ["page_id"], name: "index_interest_points_on_page_id", using: :btree

  create_table "organizations", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "pages", force: :cascade do |t|
    t.string   "title",                                       null: false
    t.integer  "page_type",               default: 1
    t.integer  "color_palette",           default: 3
    t.string   "custom_color_palette"
    t.integer  "case_study_id",                               null: false
    t.datetime "created_at",                                  null: false
    t.datetime "updated_at",                                  null: false
    t.string   "background_file_name"
    t.string   "background_content_type"
    t.integer  "background_file_size"
    t.datetime "background_updated_at"
    t.string   "basemap",                 default: "terrain"
    t.string   "basemap_url"
    t.text     "body"
    t.text     "custom_basemap"
    t.string   "column_selected"
  end

  add_index "pages", ["case_study_id"], name: "index_pages_on_case_study_id", using: :btree

  create_table "taggings", force: :cascade do |t|
    t.integer  "tag_id"
    t.integer  "taggable_id"
    t.string   "taggable_type"
    t.integer  "tagger_id"
    t.string   "tagger_type"
    t.string   "context",       limit: 128
    t.datetime "created_at"
  end

  add_index "taggings", ["tag_id", "taggable_id", "taggable_type", "context", "tagger_id", "tagger_type"], name: "taggings_idx", unique: true, using: :btree
  add_index "taggings", ["taggable_id", "taggable_type", "context"], name: "index_taggings_on_taggable_id_and_taggable_type_and_context", using: :btree

  create_table "tags", force: :cascade do |t|
    t.string  "name"
    t.integer "taggings_count", default: 0
  end

  add_index "tags", ["name"], name: "index_tags_on_name", unique: true, using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "email",                  default: "",    null: false
    t.string   "encrypted_password",     default: "",    null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,     null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                             null: false
    t.datetime "updated_at",                             null: false
    t.integer  "organization_id"
    t.boolean  "is_admin",               default: false
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  add_foreign_key "contacts", "case_studies"
  add_foreign_key "data_layers", "pages"
  add_foreign_key "interest_points", "pages"
  add_foreign_key "pages", "case_studies"
end
