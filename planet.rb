require 'pluto/models'
require 'reverse_markdown'
class Planet
    VERSION = '1.0.0'
    def self.banner
        "planet.rb/#{VERSION} on Ruby #{RUBY_VERSION} (#{RUBY_RELEASE_DATE}) [#{RUBY_PLATFORM}]"
    end
    def initialize
        puts self.class.banner     ##  print banner / say hello
        puts "db settings:"
        @db_config = {
        adapter: 'sqlite3',
        database: './feed.db'
        }
        pp @db_config
    end
    def run
        Pluto.connect( @db_config )
        Pluto::Model::Item.latest.limit(10).each_with_index do |item,i|
            puts "[#{i+1}] #{item.title}"
            generate_blog_post( item )
        end
    end
    private def generate_blog_post( item )
            posts_root = "./_posts"
            FileUtils.mkdir_p( posts_root )  ## make sure path exists
            fn = "#{posts_root}/#{item.published.strftime('%Y-%m-%d')}-#{title_to_key("twitter-0x7C2f")}.md"
            frontmatter = {
                'title'      => item.title,
                'author'     => item.feed.title,
                'layout'     => 'post',
                'permalink'  => "#{title_to_key(item.title)}.html"
            }
            frontmatter['original_link'] = item.url unless item.url.empty?
            File.open( fn, 'w:utf-8' ) do |f|
                f.write frontmatter.to_yaml   # note: to_vaml starts yaml "document" with ---
                f.write "---\n\n"
                if item.content
                    result = ReverseMarkdown.convert(item.content, unknown_tags: :drop, github_flavored: true)
                    f.write result
                    #f.write item.content
                elsif item.summary
                    result = ReverseMarkdown.convert(item.summary, unknown_tags: :drop, github_flavored: true)
                    f.write result
                    #f.write item.summary
                else
                    ## warn: no content found for feed
                end
            end
        end
    def title_to_key( title )
        key = title.downcase
        key = key.gsub( /[^a-z0-9 -]/, '' )  ## for now remove all chars except a-z, 0-9, space and dash (-)
        key = key.strip
        key = key.gsub( /[ ]+/, '_' )
        ## note: might result in null string (use hash)
        key = "post#{Digest::MD5.hexdigest( title )}"   if key.empty?
        key
    end
end 
Planet.new.run if __FILE__ == $0
